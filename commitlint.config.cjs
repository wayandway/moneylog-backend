module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 코드 포맷팅 (기능 변경 없음)
        'refactor', // 리팩토링 (기능 변화 없음)
        'perf', // 성능 개선
        'test', // 테스트 코드 추가
        'build', // 빌드 시스템 수정
        'chore', // 기타 작업 (패키지 업데이트 등)
      ],
    ],

    // 2. subject(제목)는 항상 소문자로 시작해야 함 (필수: 에러)
    'subject-case': [2, 'always', 'lower-case'],

    // 3. 커밋 메시지 제목 최대 길이 제한 (필수: 에러)
    'header-max-length': [2, 'always', 72],

    // 4. 커밋 메시지에 빈 줄 없이 Body를 쓰지 않도록 강제 (권장: 경고)
    'body-leading-blank': [1, 'always'],

    // 5. Footer에 빈 줄 없이 작성하지 않도록 강제 (권장: 경고)
    'footer-leading-blank': [1, 'always'],

    // 6. scope(범위) 선택을 강제하지 않음 (권장: 경고)
    'scope-empty': [1, 'never'],

    // 7. 커밋 메시지 타입을 소문자로 강제 (필수: 에러)
    'type-case': [2, 'always', 'lower-case'],

    // 8. Footer에 이슈 번호가 포함되었는지 확인 (선택: 경고)
    'references-empty': [1, 'never'],
  },
};
