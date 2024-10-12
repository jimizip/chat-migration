# 채팅 데이터 마이그레이션 & redis 어댑터를 사용한 소켓 서버 분리

패키지 설치하기

```
npm install
```

서버 실행하기

```
npm run start:dev
```

localhost:3000 포트로 기본 설정 되어 있습니다.
Query Parameter로 roomdId 와 userId가 설정 가능합니다

```
http://localhost:3000/?roomId=100&userId=1
```

테스트를 사용할 수 있습니다

```
npm run test chat.service  // chat.service.ts 에 대한 테스트 실행
```
