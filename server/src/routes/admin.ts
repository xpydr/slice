import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { laasLicenseService } from '../services/laas-license-service';
import { authenticateTenant, AuthenticatedRequest } from '../middleware/tenant-auth';
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
} from '../types';

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

      const tenant = await db.createTenant({
        name,
        email,
        website,
        status: 'active',
        metadata,
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

  // ========== TENANT-SCOPED ROUTES (Require API Key) ==========
  // All routes below require tenant authentication via API key

  // Products (tenant-scoped)
  fastify.post<{ Body: CreateProductRequest }>(
    '/products',
    {
      preHandler: [authenticateTenant],
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
      preHandler: [authenticateTenant],
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
      preHandler: [authenticateTenant],
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

  // Plans (tenant-scoped)
  fastify.post<{ Body: CreatePlanRequest }>(
    '/plans',
    {
      preHandler: [authenticateTenant],
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

        const { productId, name, description, maxSeats, maxDevices, expiresInDays, features } = request.body;

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
          maxDevices,
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
      preHandler: [authenticateTenant],
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
      preHandler: [authenticateTenant],
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

  // Licenses (tenant-scoped)
  fastify.post<{ Body: CreateLicenseRequest }>(
    '/licenses',
    {
      preHandler: [authenticateTenant],
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

        const license = await laasLicenseService.createLicense(tenant.id, planId, undefined, expiresInDays);

        if (!license) {
          return reply.code(500).send({
            success: false,
            error: 'Failed to create license',
          });
        }

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
      preHandler: [authenticateTenant],
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
      preHandler: [authenticateTenant],
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

  // Assign license to user
  fastify.post<{ Params: { id: string }; Body: AssignLicenseRequest }>(
    '/licenses/:id/assign',
    {
      preHandler: [authenticateTenant],
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

  // Users (tenant-scoped)
  fastify.post<{ Body: CreateUserRequest }>(
    '/users',
    {
      preHandler: [authenticateTenant],
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
      preHandler: [authenticateTenant],
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

  // Audit Logs (tenant-scoped)
  fastify.get<{ Querystring: { entityType?: string; entityId?: string } }>(
    '/audit-logs',
    {
      preHandler: [authenticateTenant],
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
