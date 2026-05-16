import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

const proxy = createProxyMiddleware({
  router: {
    '/api/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    '/api/users': process.env.USER_SERVICE_URL || 'http://localhost:3002',
    '/api/quotes': process.env.QUOTE_SERVICE_URL || 'http://localhost:3003',
    '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    '/api/beneficiary': process.env.BENEFICIARY_SERVICE_URL || 'http://localhost:3005',
    '/api/compliance': process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3006',
    '/api/document': process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3007',
    '/api/notification': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
  },
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Keep the path as is, or rewrite if needed. Here we pass the full path down.
    return path;
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers['x-correlation-id']) {
      proxyReq.setHeader('x-correlation-id', req.headers['x-correlation-id'] as string);
    }
    // Inject user info if authenticated
    if ((req as any).user) {
      proxyReq.setHeader('x-user-id', (req as any).user.sub);
      proxyReq.setHeader('x-user-email', (req as any).user.email);
    }
  },
});

@ApiTags('Gateway')
@ApiBearerAuth()
@Controller('api')
export class GatewayController {
  
  // Example of a public route that does not require JWT (e.g., login/register)
  @All('auth/*')
  @ApiOperation({ summary: 'Proxy to Auth Service (Public)' })
  proxyAuth(@Req() req: Request, @Res() res: Response) {
    proxy(req as any, res as any, (err) => {
      if (err) {
         res.status(500).send('Proxy Error');
      }
    });
  }

  // All other routes require JWT
  @All('*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to other services (Authenticated)' })
  proxyAll(@Req() req: Request, @Res() res: Response) {
    proxy(req as any, res as any, (err) => {
      if (err) {
         res.status(500).send('Proxy Error');
      }
    });
  }
}
