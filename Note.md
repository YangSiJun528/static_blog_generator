언젠가 다시 개발할 때 헷갈리지 않게 정리된 문서

## 프로젝트 구조

```
.github/
└── workflows/             # GitHub Actions 워크플로우 정의 (예: deploy.yml)
assets/                    # 웹사이트에 사용되는 정적 자산 (CSS, 이미지 등)
files/                     # 블로그 게시물에 포함될 수 있는 사용자 파일 (예: 이미지)
notes/                     # Markdown 형식의 블로그 게시물 및 노트 원본
├── about/
│   └── about-me.md
├── obsidian/
│   └── ...
└── posts/
    └── 2025/
        └── 07/
            └── first-post.md
output/                    # 생성된 정적 웹사이트 파일 (배포 대상)
statics/                   # 웹사이트 루트에 직접 복사될 정적 파일 (예: robots.txt)
src/                       # TypeScript 소스 코드
├── client/                # 클라이언트 측 JavaScript 코드
│   └── toggle.ts          # 토글 기능 관련 클라이언트 스크립트
├── utils/                 # 유틸리티 함수
│   ├── directoryTraversal.ts # 디렉토리 탐색 유틸리티
│   └── fileOperations.ts  # 파일 복사 및 처리 유틸리티
├── generator.ts           # 정적 블로그 생성의 핵심 로직
├── htmlGenerator.ts       # HTML 페이지 구조 및 내용 생성
├── index.ts               # 애플리케이션 진입점
├── parser.ts              # Markdown 구문 분석 및 HTML 변환
├── rssGenerator.ts        # RSS/Atom/JSON 피드 생성 로직
└── toggleGenerator.ts     # HTML에 토글 기능 스크립트 주입
package.json               # 프로젝트 의존성 및 스크립트 정의
package-lock.json          # 정확한 의존성 버전 기록
tsconfig.json              # TypeScript 컴파일러 설정
```

### 역할별 설명

-   **`.github/workflows/`**: GitHub Actions 워크플로우 파일이 위치합니다. `deploy.yml`은 코드가 `main` 브랜치에 푸시될 때마다 정적 블로그를 빌드하고 GitHub Pages에 배포하는 역할을 합니다.
-   **`assets/`**: 웹사이트의 전역 CSS 파일(`normalize.css`)과 같은 공통 자산이 포함됩니다. 이 파일들은 빌드 시 `output/assets/`로 복사됩니다.
-   **`files/`**: 블로그 게시물에서 참조될 수 있는 이미지나 기타 파일들이 위치합니다. 이 파일들은 빌드 시 `output/files/`로 복사됩니다.
-   **`notes/`**: 블로그의 모든 Markdown 원본 파일이 저장되는 곳입니다. 이 디렉토리의 구조가 최종 웹사이트의 URL 구조를 결정합니다.
-   **`output/`**: `npm start` 명령을 통해 생성된 최종 정적 웹사이트 파일들이 저장되는 디렉토리입니다. 이 디렉토리의 내용이 GitHub Pages에 배포됩니다.
-   **`statics/`**: `robots.txt`와 같이 웹사이트의 루트 경로에 직접 위치해야 하는 정적 파일들을 위한 디렉토리입니다. 이 디렉토리의 내용은 빌드 시 `output/`의 최상위로 복사됩니다.
-   **`src/`**: 프로젝트의 모든 TypeScript 소스 코드가 포함됩니다.
    -   **`src/generator.ts`**: 블로그 생성 프로세스의 전체 흐름을 제어하는 메인 스크립트입니다. 파일 복사, Markdown 파싱, HTML 생성, RSS 피드 생성 등을 조율합니다.
    -   **`src/parser.ts`**: `markdown-it` 라이브러리를 사용하여 Markdown 콘텐츠를 HTML로 변환하고, 내부 Markdown 링크를 HTML 링크로 올바르게 처리합니다.
    -   **`src/htmlGenerator.ts`**: Markdown에서 변환된 HTML 콘텐츠를 사용하여 완전한 HTML 페이지(헤더, 푸터, CSS 포함)를 생성합니다. 디렉토리 인덱스 페이지도 여기서 생성됩니다.
    -   **`src/toggleGenerator.ts`**: HTML 페이지에 클라이언트 측 토글 기능을 위한 JavaScript 코드를 주입합니다.
    -   **`src/rssGenerator.ts`**: 블로그 게시물 데이터를 기반으로 RSS, Atom, JSON 피드 파일을 생성합니다.
    -   **`src/client/toggle.ts`**: 웹사이트에서 디렉토리 목록 등의 토글 기능을 담당하는 클라이언트 측 JavaScript 로직을 포함합니다.
    -   **`src/utils/`**: 파일 시스템 작업(`fileOperations.ts`) 및 디렉토리 탐색(`directoryTraversal.ts`)과 같은 재사용 가능한 유틸리티 함수들을 제공합니다.
-   **`package.json`**: 프로젝트의 이름, 버전, 스크립트, 개발 및 런타임 의존성 패키지 목록을 정의합니다.
-   **`tsconfig.json`**: TypeScript 컴파일러 옵션을 설정합니다.

## 시작하기

1.  **의존성 설치**: 프로젝트 루트에서 다음 명령어를 실행하여 필요한 패키지를 설치합니다.
    ```bash
    npm install
    ```
2.  **블로그 생성**: 다음 명령어를 실행하여 정적 블로그를 생성합니다. 생성된 파일은 `output/` 디렉토리에 저장됩니다.
    ```bash
    npm start
    ```
