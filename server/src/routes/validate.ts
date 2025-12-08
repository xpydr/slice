import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { laasLicenseService } from '../services/laas-license-service';
import { ValidateLicenseRequest, ApiResponse, ValidateLicenseResponse } from '../types';
import { authenticateTenant, AuthenticatedRequest } from '../middleware/tenant-auth';

async function validateRoutes(fastify: FastifyInstance) {
  // Validate user license - main LaaS endpoint
  // Requires: Authorization header with API key
  // Body: { userId, deviceId?, deviceInfo? }
  fastify.post<{ Body: ValidateLicenseRequest }>(
    '/validate',
    {
      preHandler: [authenticateTenant],
    },
    async (request: FastifyRequest<{ Body: ValidateLicenseRequest }>, reply: FastifyReply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const tenant = authenticatedRequest.tenant;

        if (!tenant) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { userId, deviceId, deviceInfo }: ValidateLicenseRequest = request.body;

        if (!userId) {
          return reply.code(400).send({
            success: false,
            error: 'Missing required field: userId',
          });
        }

        const result = await laasLicenseService.validateUserLicense(
          tenant.id,
          userId,
          deviceId,
          deviceInfo
        );

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error('Validation error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}

export default validateRoutes;
