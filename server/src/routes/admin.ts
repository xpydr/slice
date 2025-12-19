import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { laasLicenseService } from '../services/laas-license-service';
import { subscriptionLicenseService } from '../services/subscription-license-service';
import { authenticateTenant, authenticateTenantSession, AuthenticatedRequest } from '../middleware/tenant-auth';
import {
  ApiResponse,
  CreateProductRequest,
  CreatePlanRequest,
  CreateLicenseRequest,
  CreateTenantRequest,
  CreateApiKeyRequest,
  CreateUserRequest,
  AssignLicenseRequest,
  LicenseUsage,
  RegisterTenantRequest,
  LoginRequest,
  LoginResponse,
} from '../types';
import { hashPassword, verifyPassword } from '../services/password-service';
import { createSession, getSessionByToken, revokeSession } from '../services/jwt-service';
import { invalidateCacheByTags } from '../middleware/cache';
import { generateCode, hashCode, verifyCode } from '../services/verification-code-service';
import { sendVerificationCode } from '../services/email-service';
import { VerifyEmailRequest } from '../types';

async function adminRoutes(fastify: FastifyInstance) {
  // ========== TENANT MANAGEMENT (Platform Admin) ==========
  // These endpoints are for platform administrators managing tenants
  // In production, add admin authentication here

  // Create tenant
  fastify.post<{ Body: CreateTenantRequest }>('/tenants', async (request: FastifyRequest<{ Body: CreateTenantRequest }>, reply: FastifyReply) => {
    try {
      const { name, email, website, metadata } = request.body;

      if (!name) {
        return reply.code(400).send({
          success: false,
          error: 'Tenant name is required',
        });
      }

      // For admin-created tenants, generate a temporary password hash
      // In production, admin should set a password or send invitation
      const tempPasswordHash = await hashPassword('temp-password-' + Date.now());
      
      const tenant = await db.createTenant({
        name,
        email: email || `admin-${Date.now()}@example.com`, // Fallback if no email
        website,
        status: 'inactive',
        emailVerified: false,
        metadata,
        passwordHash: tempPasswordHash,
      });

      await db.createAuditLog({
        action: 'tenant.created',
        entityType: 'tenant',
        entityId: tenant.id,
        metadata: { name, email },
      });

      return reply.code(201).send({
        success: true,
        data: tenant,
      });
    } catch (error) {
      console.error('Create tenant error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Get all tenants
  fastify.get('/tenants', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Add pagination
      const tenants = await db.getAllTenants();
      return reply.send({
        success: true,
        data: tenants,
      });
    } catch (error) {
      console.error('Get tenants error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Get tenant by ID
  fastify.get<{ Params: { id: string } }>('/tenants/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const tenant = await db.getTenant(request.params.id);
      if (!tenant) {
        return reply.code(404).send({
          success: false,
          error: 'Tenant not found',
        });
      }
      return reply.send({
        success: true,
        data: tenant,
      });
    } catch (error) {
      console.error('Get tenant error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Create API key for tenant
  fastify.post<{ Params: { tenantId: string }; Body: CreateApiKeyRequest }>(
    '/tenants/:tenantId/api-keys',
    async (request: FastifyRequest<{ Params: { tenantId: string }; Body: CreateApiKeyRequest }>, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params;
        const { name, expiresInDays } = request.body;

        if (!name) {
          return reply.code(400).send({
            success: false,
            error: 'API key name is required',
          });
        }

        // Verify tenant exists
        const tenant = await db.getTenant(tenantId);
        if (!tenant) {
          return reply.code(404).send({
            success: false,
            error: 'Tenant not found',
          });
        }

        const { apiKey, apiKeyRecord } = await db.createApiKey(tenantId, name, expiresInDays);

        await db.createAuditLog({
          tenantId,
          action: 'api_key.created',
          entityType: 'api_key',
          entityId: apiKeyRecord.id,
          metadata: { name },
        });

        // Return API key (only shown once!)
        return reply.code(201).send({
          success: true,
          data: {
            apiKey, // Plaintext key - store this securely!
            apiKeyRecord,
          },
        });
      } catch (error) {
        console.error('Create API key error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // ========== AUTHENTICATION ROUTES ==========
  // Tenant registration and login endpoints

  // Register tenant (self-registration)
  fastify.post<{ Body: RegisterTenantRequest }>('/auth/register', async (request: FastifyRequest<{ Body: RegisterTenantRequest }>, reply: FastifyReply) => {
    try {
      const { name, email, password, website, metadata } = request.body;

      if (!name || !email || !password) {
        return reply.code(400).send({
          success: false,
          error: 'Name, email, and password are required',
        });
      }

      // Check if tenant with this email already exists
      const existingTenant = await db.getTenantByEmail(email);
      if (existingTenant) {
        return reply.code(409).send({
          success: false,
          error: 'Tenant with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create tenant with INACTIVE status
      const tenant = await db.createTenant({
        name,
        email,
        passwordHash,
        website,
        status: 'inactive',
        emailVerified: false,
        metadata,
      });

      await db.createAuditLog({
        action: 'tenant.created',
        entityType: 'tenant',
        entityId: tenant.id,
        metadata: { name, email },
      });

      // Generate and send verification code
      try {
        const code = generateCode();
        const codeHash = await hashCode(code);

        // Set expiration to 15 minutes from now
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Store verification code
        await db.createVerificationCode(tenant.id, codeHash, expiresAt);

        // Send email
        await sendVerificationCode(email, code);
      } catch (emailError) {
        // Log error but don't fail registration
        console.error('Failed to send verification email during registration:', emailError);
      }

      return reply.code(201).send({
        success: true,
        data: tenant,
      });
    } catch (error) {
      console.error('Register tenant error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Login tenant
  fastify.post<{ Body: LoginRequest }>('/auth/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.code(400).send({
          success: false,
          error: 'Email and password are required',
        });
      }

      // Get tenant by email (includes passwordHash for verification)
      const tenantWithHash = await db.getTenantByEmail(email);
      if (!tenantWithHash) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, tenantWithHash.passwordHash);
      if (!isValidPassword) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Create session (generates JWT and stores in database)
      const { token, session } = await createSession(tenantWithHash.id);

      // Set HTTP-only cookie with JWT token
      reply.setCookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'lax', // CSRF protection
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/',
      });

      // Return tenant info (without passwordHash and without token in body)
      const { passwordHash: _, ...tenant } = tenantWithHash;

      // Check if email verification is required
      const requiresVerification = !tenant.emailVerified;

      return reply.send({
        success: true,
        data: {
          tenant,
          requiresVerification,
        },
      } as LoginResponse);
    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Get current authenticated tenant
  fastify.get('/auth/me', { preHandler: authenticateTenantSession }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.tenant) {
        return reply.code(401).send({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Get full tenant details
      const tenant = await db.getTenant(request.tenant.id);
      if (!tenant) {
        return reply.code(404).send({
          success: false,
          error: 'Tenant not found',
        });
      }

      // Return tenant info (without passwordHash)
      const { ...tenantWithoutHash } = tenant;

      return reply.send({
        success: true,
        data: {
          tenant: tenantWithoutHash,
        },
      });
    } catch (error) {
      console.error('Get current tenant error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Send verification code
  fastify.post('/auth/send-verification-code', { preHandler: authenticateTenantSession }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.tenant) {
        return reply.code(401).send({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Get tenant details
      const tenant = await db.getTenant(request.tenant.id);
      if (!tenant) {
        return reply.code(404).send({
          success: false,
          error: 'Tenant not found',
        });
      }

      // Check if already verified
      if (tenant.emailVerified) {
        return reply.send({
          success: true,
          message: 'Email already verified',
        });
      }

      // Generate 6-digit code
      const code = generateCode();
      const codeHash = await hashCode(code);

      // Set expiration to 15 minutes from now
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Store verification code
      await db.createVerificationCode(request.tenant.id, codeHash, expiresAt);

      // Send email
      await sendVerificationCode(tenant.email, code);

      return reply.send({
        success: true,
        message: 'Verification code sent',
      });
    } catch (error) {
      console.error('Send verification code error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Verify email with code
  fastify.post<{ Body: VerifyEmailRequest }>('/auth/verify-email', { preHandler: authenticateTenantSession }, async (request: FastifyRequest<{ Body: VerifyEmailRequest }>, reply: FastifyReply) => {
    try {
      const authRequest = request as AuthenticatedRequest;
      if (!authRequest.tenant) {
        return reply.code(401).send({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { code } = request.body;

      if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid code format. Code must be 6 digits',
        });
      }

      // Get stored verification code
      const storedCode = await db.getVerificationCode(authRequest.tenant.id);
      if (!storedCode) {
        return reply.code(400).send({
          success: false,
          error: 'No verification code found. Please request a new code',
        });
      }

      // Check if code has expired
      if (new Date() > storedCode.expiresAt) {
        await db.deleteVerificationCode(authRequest.tenant.id);
        return reply.code(400).send({
          success: false,
          error: 'Verification code has expired. Please request a new code',
        });
      }

      // Verify code
      const isValid = await verifyCode(code, storedCode.codeHash);
      if (!isValid) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid verification code',
        });
      }

      // Update tenant email verification status
      await db.updateTenantEmailVerification(authRequest.tenant.id, true);

      // Delete used verification code
      await db.deleteVerificationCode(authRequest.tenant.id);

      // Get updated tenant
      const tenant = await db.getTenant(authRequest.tenant.id);

      return reply.send({
        success: true,
        data: {
          tenant,
        },
      });
    } catch (error) {
      console.error('Verify email error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Resend verification code
  fastify.post('/auth/resend-verification-code', { preHandler: authenticateTenantSession }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.tenant) {
        return reply.code(401).send({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Get tenant details
      const tenant = await db.getTenant(request.tenant.id);
      if (!tenant) {
        return reply.code(404).send({
          success: false,
          error: 'Tenant not found',
        });
      }

      // Check if already verified
      if (tenant.emailVerified) {
        return reply.send({
          success: true,
          message: 'Email already verified',
        });
      }

      // Delete existing code (if any)
      await db.deleteVerificationCode(request.tenant.id);

      // Generate new 6-digit code
      const code = generateCode();
      const codeHash = await hashCode(code);

      // Set expiration to 15 minutes from now
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Store verification code
      await db.createVerificationCode(request.tenant.id, codeHash, expiresAt);

      // Send email
      await sendVerificationCode(tenant.email, code);

      return reply.send({
        success: true,
        message: 'Verification code resent',
      });
    } catch (error) {
      console.error('Resend verification code error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Logout tenant
  fastify.post('/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies.auth_token;

      if (token) {
        // Get session from database
        const session = await getSessionByToken(token);
        
        if (session) {
          // Revoke session in database
          await revokeSession(session.id);
        }
      }

      // Clear cookie
      reply.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the cookie even if there's an error
      reply.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    }
  });

  // ========== TENANT-SCOPED ROUTES ==========
  // Dashboard routes use JWT cookie auth (authenticateTenantSession)
  // Tenant server routes use API key auth (authenticateTenant)

  // Products (tenant-scoped) - Dashboard operations
  fastify.post<{ Body: CreateProductRequest }>(
    '/products',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Body: CreateProductRequest }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { name, description } = request.body;

        if (!name) {
          return reply.code(400).send({
            success: false,
            error: 'Product name is required',
          });
        }

        const product = await db.createProduct({
          tenantId: tenant.id,
          name,
          description,
        });

        await db.createAuditLog({
          tenantId: tenant.id,
          action: 'product.created',
          entityType: 'product',
          entityId: product.id,
          metadata: { name },
        });

        // Invalidate cache
        await invalidateCacheByTags([`tenant:${tenant.id}:products`]);

        return reply.code(201).send({
          success: true,
          data: product,
        });
      } catch (error) {
        console.error('Create product error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get(
    '/products',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const products = await db.getProductsByTenant(tenant.id);
        return reply.send({
          success: true,
          data: products,
        });
      } catch (error) {
        console.error('Get products error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    '/products/:id',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const product = await db.getProduct(request.params.id);
        if (!product) {
          return reply.code(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Verify product belongs to tenant
        if (product.tenantId !== tenant.id) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied',
          });
        }

        return reply.send({
          success: true,
          data: product,
        });
      } catch (error) {
        console.error('Get product error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Plans (tenant-scoped) - Dashboard operations
  fastify.post<{ Body: CreatePlanRequest }>(
    '/plans',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Body: CreatePlanRequest }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { productId, name, description, maxSeats, expiresInDays, features } = request.body;

        if (!productId || !name) {
          return reply.code(400).send({
            success: false,
            error: 'Product ID and plan name are required',
          });
        }

        // Verify product belongs to tenant
        const product = await db.getProduct(productId);
        if (!product) {
          return reply.code(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        if (product.tenantId !== tenant.id) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied',
          });
        }

        const plan = await db.createPlan({
          productId,
          name,
          description,
          maxSeats,
          expiresInDays,
          features,
        });

        await db.createAuditLog({
          tenantId: tenant.id,
          action: 'plan.created',
          entityType: 'plan',
          entityId: plan.id,
          metadata: { productId, name },
        });

        // Invalidate cache
        await invalidateCacheByTags([`tenant:${tenant.id}:plans`, `tenant:${tenant.id}:products`]);

        return reply.code(201).send({
          success: true,
          data: plan,
        });
      } catch (error) {
        console.error('Create plan error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get<{ Querystring: { productId?: string } }>(
    '/plans',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Querystring: { productId?: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const productId = request.query.productId;
        let plans;

        if (productId) {
          // Verify product belongs to tenant
          const product = await db.getProduct(productId);
          if (product && product.tenantId !== tenant.id) {
            return reply.code(403).send({
              success: false,
              error: 'Access denied',
            });
          }
          plans = await db.getPlansByProduct(productId);
        } else {
          // Get all plans for tenant's products
          const products = await db.getProductsByTenant(tenant.id);
          const allPlans = await Promise.all(
            products.map(p => db.getPlansByProduct(p.id))
          );
          plans = allPlans.flat();
        }

        return reply.send({
          success: true,
          data: plans,
        });
      } catch (error) {
        console.error('Get plans error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    '/plans/:id',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const plan = await db.getPlan(request.params.id);
        if (!plan) {
          return reply.code(404).send({
            success: false,
            error: 'Plan not found',
          });
        }

        // Verify plan belongs to tenant
        const product = await db.getProduct(plan.productId);
        if (!product || product.tenantId !== tenant.id) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied',
          });
        }

        return reply.send({
          success: true,
          data: plan,
        });
      } catch (error) {
        console.error('Get plan error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Licenses (tenant-scoped) - Dashboard operations
  fastify.post<{ Body: CreateLicenseRequest }>(
    '/licenses',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Body: CreateLicenseRequest }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { planId, expiresInDays } = request.body;

        if (!planId) {
          return reply.code(400).send({
            success: false,
            error: 'Plan ID is required',
          });
        }

        // Verify plan belongs to tenant
        const plan = await db.getPlan(planId);
        if (!plan) {
          return reply.code(404).send({
            success: false,
            error: 'Plan not found',
          });
        }

        const product = await db.getProduct(plan.productId);
        if (!product || product.tenantId !== tenant.id) {
          return reply.code(403).send({
            success: false,
            error: 'Access denied',
          });
        }

        // Check license limit before creating
        const limitCheck = await subscriptionLicenseService.checkLicenseLimit(tenant.id);
        if (!limitCheck.allowed) {
          return reply.code(403).send({
            success: false,
            error: limitCheck.reason || 'License limit exceeded',
            quota: limitCheck.quota,
          });
        }

        const license = await laasLicenseService.createLicense(tenant.id, planId, undefined, expiresInDays);

        if (!license) {
          return reply.code(500).send({
            success: false,
            error: 'Failed to create license',
          });
        }

        // Increment license count after successful creation
        await subscriptionLicenseService.incrementLicenseCount(tenant.id);

        // Invalidate cache
        await invalidateCacheByTags([`tenant:${tenant.id}:licenses`]);

        return reply.code(201).send({
          success: true,
          data: license,
        });
      } catch (error) {
        console.error('Create license error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get<{ Querystring: { planId?: string } }>(
    '/licenses',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Querystring: { planId?: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const planId = request.query.planId;
        let licenses;

        if (planId) {
          // Verify plan belongs to tenant
          const plan = await db.getPlan(planId);
          if (plan) {
            const product = await db.getProduct(plan.productId);
            if (product && product.tenantId !== tenant.id) {
              return reply.code(403).send({
                success: false,
                error: 'Access denied',
              });
            }
          }
          licenses = await db.getLicensesByPlan(planId);
        } else {
          // Get all licenses for tenant's products
          const products = await db.getProductsByTenant(tenant.id);
          const allLicenses = await Promise.all(
            products.flatMap(async (p) => {
              const plans = await db.getPlansByProduct(p.id);
              return Promise.all(plans.map(plan => db.getLicensesByPlan(plan.id)));
            })
          );
          licenses = allLicenses.flat().flat();
        }

        return reply.send({
          success: true,
          data: licenses,
        });
      } catch (error) {
        console.error('Get licenses error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    '/licenses/:id',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const usage = await laasLicenseService.getLicenseUsage(tenant.id, request.params.id);
        if (!usage) {
          return reply.code(404).send({
            success: false,
            error: 'License not found',
          });
        }

        return reply.send({
          success: true,
          data: usage,
        });
      } catch (error) {
        console.error('Get license usage error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { status: string } }>(
    '/licenses/:id/status',
    {
      preHandler: [authenticateTenant],
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { status } = request.body;
        const validStatuses = ['active', 'suspended', 'revoked', 'expired'];

        if (!status || !validStatuses.includes(status)) {
          return reply.code(400).send({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`,
          });
        }

        const updated = await laasLicenseService.updateLicenseStatus(
          tenant.id,
          request.params.id,
          status as 'active' | 'suspended' | 'revoked' | 'expired'
        );

        if (!updated) {
          return reply.code(404).send({
            success: false,
            error: 'License not found',
          });
        }

        return reply.send({
          success: true,
          data: updated,
        });
      } catch (error) {
        console.error('Update license status error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Assign license to user - Tenant server operation (uses API key)
  fastify.post<{ Params: { id: string }; Body: AssignLicenseRequest }>(
    '/licenses/:id/assign',
    {
      preHandler: [authenticateTenant], // Bearer token for tenant server
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: AssignLicenseRequest }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { userId, metadata } = request.body;

        if (!userId) {
          return reply.code(400).send({
            success: false,
            error: 'User ID is required',
          });
        }

        const userLicense = await laasLicenseService.assignLicenseToUser(
          tenant.id,
          userId,
          request.params.id
        );

        if (!userLicense) {
          return reply.code(404).send({
            success: false,
            error: 'License not found or access denied',
          });
        }

        return reply.code(201).send({
          success: true,
          data: userLicense,
        });
      } catch (error) {
        console.error('Assign license error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Users (tenant-scoped) - Tenant server operation (uses API key)
  fastify.post<{ Body: CreateUserRequest }>(
    '/users',
    {
      preHandler: [authenticateTenant], // Bearer token for tenant server
    },
    async (request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { externalId, email, name, metadata } = request.body;

        if (!externalId) {
          return reply.code(400).send({
            success: false,
            error: 'External ID is required',
          });
        }

        // Check if user already exists
        let user = await db.getUserByExternalId(tenant.id, externalId);
        if (user) {
          return reply.code(409).send({
            success: false,
            error: 'User already exists',
          });
        }

        user = await db.createUser({
          tenantId: tenant.id,
          externalId,
          email,
          name,
          metadata,
        });

        await db.createAuditLog({
          tenantId: tenant.id,
          action: 'user.created',
          entityType: 'user',
          entityId: user.id,
          metadata: { externalId },
        });

        // Invalidate cache
        await invalidateCacheByTags([`tenant:${tenant.id}:users`]);

        return reply.code(201).send({
          success: true,
          data: user,
        });
      } catch (error) {
        console.error('Create user error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  fastify.get<{ Querystring: { externalId?: string } }>(
    '/users',
    {
      preHandler: [authenticateTenantSession], // Dashboard operation
    },
    async (request: FastifyRequest<{ Querystring: { externalId?: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const externalId = request.query.externalId;
        let users;

        if (externalId) {
          const user = await db.getUserByExternalId(tenant.id, externalId);
          users = user ? [user] : [];
        } else {
          users = await db.getUsersByTenant(tenant.id);
        }

        return reply.send({
          success: true,
          data: users,
        });
      } catch (error) {
        console.error('Get users error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Audit Logs (tenant-scoped) - Dashboard operation
  fastify.get<{ Querystring: { entityType?: string; entityId?: string } }>(
    '/audit-logs',
    {
      preHandler: [authenticateTenantSession],
    },
    async (request: FastifyRequest<{ Querystring: { entityType?: string; entityId?: string } }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const entityType = request.query.entityType;
        const entityId = request.query.entityId;

        const logs = await db.getAuditLogs(entityType, entityId, tenant.id);

        return reply.send({
          success: true,
          data: logs,
        });
      } catch (error) {
        console.error('Get audit logs error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}

export default adminRoutes;
