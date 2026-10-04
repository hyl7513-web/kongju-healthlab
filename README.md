# 국립공주대학교 보건정책연구실 홈페이지

- 사이트 주소: https://hyl7513-web.github.io/kongju-healthlab/
- 내용은 모두 `data/` 폴더의 파일 6개에 들어 있습니다. **디자인 코드는 건드리지 않고 이 파일들만 고치면 됩니다.**
- 파일을 고쳐서 저장(commit)하면 몇 분 안에 사이트에 자동 반영됩니다.

| 파일 | 내용 |
|---|---|
| `data/members.yaml` | 구성원 (재학생·졸업생) |
| `data/papers.yaml` | 게재 논문 |
| `data/projects.yaml` | 연구과제 |
| `data/news.yaml` | 소식 (언론·수상·공지) |
| `data/professor.yaml` | 지도교수 정보 |
| `data/site.yaml` | 연구실 이름·주소·연락처·연구 분야 |
| `public/photos/` | 구성원·교수 사진 |
| `public/logo.png` | 연구실 로고 (상단·탭 아이콘) |

---

## 수정하는 방법 (GitHub 웹사이트에서)

1. 저장소에서 `data` 폴더 → 고칠 파일을 누릅니다.
2. 오른쪽 위 **연필 아이콘(Edit this file)** 을 누릅니다.
3. 내용을 고친 뒤 **Commit changes…** → 다시 **Commit changes** 를 누릅니다.
4. 저장소 위쪽 **Actions** 탭에서 진행 상황을 볼 수 있습니다. 초록 체크(✓)가 뜨면 반영 완료입니다.

### 작성 규칙 세 가지
- **들여쓰기는 스페이스(띄어쓰기)로**, 위아래 항목과 칸을 똑같이 맞춥니다. 탭 키는 쓰지 않습니다.
- 각 항목은 `- ` (하이픈 + 띄어쓰기)로 시작합니다. 기존 항목 하나를 통째로 복사해서 고치는 게 가장 안전합니다.
- 내용에 `:` (콜론)이나 `"` 가 들어가면 전체를 큰따옴표로 감싸고, 안쪽 큰따옴표 앞에는 `\` 를 붙입니다.
  예) `title: "Trends in X: a cohort study"`

---

## 자주 하는 작업

### 새 구성원 추가 — `data/members.yaml`
아래 블록을 맨 아래에 붙여넣고 고칩니다.
```yaml
- id: hong-gildong          # 영문 소문자·숫자·하이픈. 다른 사람과 겹치면 안 됨
  name: 홍길동
  status: 재학              # 재학 / 졸업
  course: 석사과정
  email: hong@example.com
  email_public: false       # true 로 해야 사이트에 이메일이 보임
  photo: ""                 # 사진을 올렸다면 파일 이름 (예: hong.jpg)
```

### 졸업 처리
해당 사람의 `status: 재학` 을 `status: 졸업` 으로, `course` 를 학위명(예: 보건학 석사)으로 바꿉니다. 졸업생 목록으로 자동 이동합니다.
(`note`, `graduated`, `current` 칸은 기록용이며 현재 사이트에는 표시되지 않습니다.)

### 사진 올리기
1. `public/photos` 폴더로 이동 → **Add file → Upload files** 로 사진을 올립니다. (파일 이름은 영문 권장: `hong.jpg`)
2. `members.yaml` 에서 그 사람의 `photo: hong.jpg` 로 적습니다.
- 세로형(약 4:5) 사진이 가장 잘 맞습니다. 용량은 1MB 이하로 줄여서 올려 주세요.

### 논문 추가 — `data/papers.yaml`
```yaml
- year: 2026
  scope: 국제                # 국제 / 국내
  authors: Hong G, Kim DS
  title: "논문 제목"
  journal: J Korean Med Sci
  citation: 2026;41(1):e1
  role: 교신저자              # 없으면 ""
  url: https://doi.org/...   # 없으면 ""
```
사이트에서는 연도별로 자동 정렬되고, 교수님 이름(김동숙 / Kim DS)은 자동으로 굵게 표시됩니다.

### 연구과제 추가 — `data/projects.yaml`
**연구실(교수님) 과제로 확인된 것만** 올립니다.
```yaml
- title: 과제명
  start: 2026.03            # 2026, 2026.03, 2026.03.15 모두 가능
  end: 2026.12
  role: 책임자
  funder: 발주기관명          # 모르면 ""
```
'진행/종료' 표시는 종료일과 오늘 날짜를 비교해 자동으로 붙습니다. (매주 월요일 자동 갱신)

### 소식·공지 추가 — `data/news.yaml`
```yaml
- date: 2026.03.02
  category: 공지            # 언론 / 수상 / 공지
  title: 2026학년도 1학기 연구실 세미나 안내
  source: ""
  url: ""
  body: 매주 수요일 오후 2시, 430호
```

### 교과목 · 모집 공고 — `data/site.yaml`
- `courses`: 학기별로 `undergrad`(학부), `graduate`(대학원) 목록에 과목명을 한 줄씩 적습니다.
- `recruit`: 모집 공고 내용입니다. 모집이 끝나면 `show: false` 로 바꾸면 홈 화면과 소개 페이지에서 사라집니다.

---

## 오류가 났을 때
- 저장 후 **Actions** 탭에 빨간 X 가 뜨면, 배포가 멈춘 것입니다. **사이트는 깨지지 않고 이전 상태가 그대로 유지됩니다.**
- 빨간 X 항목 → `build` → `Run npm run build` 를 열면 무엇이 틀렸는지 한국어로 나옵니다.
  ```
  ✗ [projects.yaml] 3번째 항목 (수급불안 필수의약품…) end: 종료일(2025.01)이 시작일(2025.10)보다 앞섭니다
  ```
- 해당 파일을 다시 열어 고치고 저장하면 자동으로 다시 배포됩니다.

자동 검사 항목: 빈 필수 칸, 날짜 형식, 종료일이 시작일보다 앞서는 경우, `status`·`category`·`scope` 값, 구성원 id 중복, 적어 둔 사진 파일이 실제로 있는지.

---

## 처음 한 번만 하는 설정
저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 바꿉니다.

## 개발용 (선택)
```bash
npm install
npm run dev          # 로컬 미리보기 http://localhost:4321/kongju-healthlab/
npm run check-data   # 데이터 검사만
npm run build        # 검사 + 빌드
```
기술 구성: [Astro](https://astro.build) 정적 사이트 + GitHub Actions + GitHub Pages.
