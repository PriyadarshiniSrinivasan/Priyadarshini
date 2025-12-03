import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    const auth = req.headers['authorization']
    
    if (!auth || !String(auth).startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }
    
    const token = String(auth).slice(7)
    try {
      req.user = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'dev' })
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}
