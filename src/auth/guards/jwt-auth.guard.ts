import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 기본 JWT 검증 로직을 활용하며, 필요 시 추가적인 인증 로직을 작성 가능
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 에러가 발생하거나 인증된 사용자가 없을 경우 예외 발생
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || '인증되지 않은 사용자입니다.');
    }
    return user; // 인증된 사용자 정보 반환
  }
}
