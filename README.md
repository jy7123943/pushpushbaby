# Push Push Baby

PushPushBaby는 [66스터디](https://github.com/fepocha/study)에서 쓰기 위해 만들어진 슬랙봇입니다.

**@pushpushbaby**를 멘션하고 그 주에 스터디한 내용을 자유롭게 적어주세요.

그러면 fepocha/study repo, `yyyy년_m월/n주차_스터디.md` 파일에 자동 업데이트됩니다.

-------

## How to use

1. Slack 프로필의 이메일 주소가 Github 이메일 주소와 일치하는지 확인해주세요.  
![profile]('./resources/profile.jpeg')

만약 일치하지 않는다면 `More` -> `Account setting`으로 이동하여 Github 이메일 주소로 변경해주세요.  
![accountsetting]('./resources/accountsetting.jpeg')

2. Slack 프로필의 Full name란을 Github name으로 변경해주세요.
(스터디 마크다운에서 title로 사용됩니다.)
![edit]('./resources/edit.png')

3. `#스터디` 채널에서 **@pushpushbaby**를 멘션하고 plan/weekly/meeting 중 한 가지 명령어와 함께 자유롭게 스터디 내용을 적어주세요.  
(줄바꿈이나 굵은 글씨, 링크, 코드 블록 등 대부분의 슬랙 문법이 자동으로 HTML로 변경되니 편하게 사용해주세요.)

  - plan: 스터디 계획 업로드
  - weekly: 스터디 주간 리포트 업로드
  - meeting: 스터디 모임 후 발표 자료 및 회고 업로드

![weekly]('./resources/weekly.png')

4. enter를 누르고 잠시 기다리면 PushPushBaby가 자동으로 repo에 업데이트하고 링크를 알려줍니다.
![success]('./resources/success.png')

5. 다음과 같이 업로드됩니다!
![result]('./resources/result.png')
