import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      return null; // 유저 정보가 없을 경우 null 반환
    }
    return user; // 인증 성공 시 사용자 정보 반환
  }
}
