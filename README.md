# Push Push Baby

PushPushBaby는 [66스터디](https://github.com/fepocha/study)에서 쓰기 위해 만들어진 슬랙봇입니다.

**@pushpushbaby**를 멘션하고 그 주에 스터디한 내용을 자유롭게 적어주세요.

그러면 fepocha/study repo, `yyyy년_m월/n주차_스터디.md` 파일에 자동 업데이트됩니다.

-------

## How to use

### 1. 슬랙 프로필 이메일 주소 확인
Slack 프로필의 이메일 주소가 Github 이메일 주소와 일치하는지 확인해주세요.  
![profile](https://user-images.githubusercontent.com/32149561/119219347-1a541e00-bb20-11eb-8e19-11b912a879a8.jpeg)


만약 일치하지 않는다면 `More` -> `Account setting`으로 이동하여 Github 이메일 주소로 변경해주세요.  
![moreaccountsetting](https://user-images.githubusercontent.com/32149561/119219354-2344ef80-bb20-11eb-9cf5-d0170a956c88.jpeg)

### 2. 슬랙 프로필 Full name 변경
Slack 프로필의 Full name란을 Github name으로 변경해주세요.
(스터디 마크다운에서 title로 사용됩니다.)
![edit](https://user-images.githubusercontent.com/32149561/119219362-29d36700-bb20-11eb-8d40-b89ac08ee6d5.png)

### 3. 봇 멘션하여 메시지 입력
`#스터디` 채널에서 **@pushpushbaby**를 멘션하고 `plan`/`weekly`/`meeting` 중 한 가지 명령어와 함께 자유롭게 스터디 내용을 적어주세요.  
(줄바꿈이나 굵은 글씨, 링크, 코드 블록 등 대부분의 슬랙 문법이 자동으로 HTML로 변경되니 편하게 사용해주세요.)

  - `plan`: 스터디 계획 업로드
  - `weekly`: 스터디 주간 리포트 업로드
  - `meeting`: 스터디 모임 후 발표 자료 및 회고 업로드

![weekly](https://user-images.githubusercontent.com/32149561/119219378-42dc1800-bb20-11eb-85c1-8b7455903a4e.png)

### 4. 엔터!
enter를 누르고 잠시 기다리면 PushPushBaby가 자동으로 repo에 업데이트하고 링크를 알려줍니다.
![success](https://user-images.githubusercontent.com/32149561/119219383-48396280-bb20-11eb-9fff-48df14b920ff.png)

### 5. 완료!
다음과 같이 업로드됩니다!

<img width="591" alt="result" src="https://user-images.githubusercontent.com/32149561/119219390-4f607080-bb20-11eb-8c16-2f9de92d7af8.png">

