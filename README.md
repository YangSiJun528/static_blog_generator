
이 저장소는 더 이상 사용되지 않습니다.

이 프로젝트는 [YangSiJun528.github.io](https://github.com/YangSiJun528/YangSiJun528.github.io)으로 이관되었습니다.

# Static Blog Generator

이 프로젝트는 Markdown 파일을 HTML 기반 정적 웹사이트로 변환하는 정적 블로그 생성기입니다. 

Node.js와 TypeScript를 기반으로 구축되었습니다.

폴더 시스템처럼 동작하는 디렉토리 인덱스 페이지를 제공합니다.   

## 주요 기능

- Markdown to HTML 변환:  `content` 디렉토리의 Markdown 파일을 읽어 HTML 페이지로 변환합니다.
- 정적 파일 처리: `assets`, `statics` 등의 파일을 포함한 결과물을 생성합니다.
- 디렉토리 인덱스 페이지: 각 디렉토리의 내용을 나열하는 `index.html` 파일을 자동으로 생성합니다. 다른 폴더와 파일 내용을 미리 열어볼 수 있습니다.

## 왜 디렉토리 구조인가요?

제 스타일에 잘 맞기 떄문입니다.

저는 예전에 [TIL(Today I Learned)을 작성](https://github.com/YangSiJun528/memory)했는데요.
현재는 작성하지 않지만, 이 때 사용한 정리 방식이 직관적이고 편해서 요즘에도 비슷한 문서 정리 방식을 사용합니다.

빠르게 문서를 찾아볼 수 있으면서, 파일을 나눠서 관리하는 방식입니다.

## 왜 만들었나요?

이런 스타일과 일치하는 저만의 사이트를 만들고 싶었지만, 다른 오픈소스 서비스는 디렉토리 구조를 지원하지 않습니다.

AI의 발전으로 인해 쉽게 개발이 가능해 직접 만들게 되었습니다.

## TMI

문서를 작성할 때는 Obsidian을 사용합니다.

Obsidian에도 비슷한 방식을 제공하는 [inline-toggle-notes](https://github.com/YangSiJun528/inline-toggle-notes) 플러그인을 개발하였습니다.

