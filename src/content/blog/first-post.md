---
title: 'First Post'
description: 'This is the first post of my new Astro blog.'
pubDate: 'Jul 08 2022'
heroImage: '@assets/blog/placeholder-hero.png'
category: 'tech'
tags: ['Dependency Injection', 'Next.js', 'TypeScript', '아키텍처']
---

**Dependency Injection(DI)**은 객체가 필요로 하는 **의존성(dependency)을 외부에서 주입받는 디자인 패턴**입니다.

Angular나 NestJS와 같은 프레임워크를 써왔다면 DI는 자연스럽게 사용하는 기능 중 하나일 겁니다. 저 역시 마찬가지였고요.

하지만 솔직히 말하면, 프레임워크가 DI를 대신해주니 그 **필요성이나 가치에 대해 깊이 체감하지 못한 채** 써왔던 것 같습니다.

그러다 최근 사이드 프로젝트를 진행하면서 **"왜 DI가 필요한가?"**라는 질문에 정면으로 마주하게 되었고, 비로소 그 진가를 느끼게 되었습니다.

---

## Next.js에서 마주한 구조적 고민: API 호출 방식의 이중성

Next.js는 SSR(Server Side Rendering)을 지원하기 때문에, 하나의 API를 호출하더라도 **서버 환경**과 **클라이언트 환경**이라는 두 가지 실행 컨텍스트를 고려해야 합니다.

HTTP 요청을 보내기 위해 `axios` 같은 클라이언트를 사용할 경우, 각 환경의 특성에 따라 `axios` 인스턴스를 나누는 것이 일반적입니다.

### 브라우저 환경에 최적화된 clientApi

```ts
clientApi.interceptors.request.use(async (config) => {
  const session = await getSession(); // 클라이언트에서만 접근 가능한 세션

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});
```

### 서버 환경에 맞춘 serverApi

```ts
serverApi.interceptors.request.use(async (config) => {
  const session = await getServerSession(createNextAuthOptions(authRepository)); // 서버 전용 세션

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});
```

---

## 블로그 목록 페이지 개발: 중복과 응집성의 균형 잡기

무한 스크롤이 적용된 블로그 글 목록 페이지를 개발하기 위해 구현을 고민하던 때였습니다.

우선 제가 설계한 블로그 목록 페이지는 초기 데이터를 SSR을 통해 서버에서 가져오고, 이후 스크롤 이벤트에 따라 클라이언트가 추가 데이터를 API로 요청하는 구조입니다.

처음에 구현은 방법은 다음과 같았습니다:

```ts
// 클라이언트 호출
getArticlesFromClient(request: ArticleListRequestDto): Promise<CursorPaginationResponseDto<Article>> {
  const response = await clientApi.get('/article', { params: request });
  return response.data;
}

// 서버 호출
getArticlesFromServer(request: ArticleListRequestDto): Promise<CursorPaginationResponseDto<Article>> {
  const response = await serverApi.get('/article', { params: request });
  return response.data;
}
```

### 문제점 1. 중복된 코드의 필연

서버와 클라이언트 모두 동일한 API(`/article`)를 호출하지만, **`axios` 인스턴스가 다르다는 이유로 거의 똑같은 코드를 두 번 작성해야** 합니다.

이런 구조는 다음과 같은 문제를 야기합니다:

- API 경로와 파라미터 로직은 동일하지만, 중복된 코드가 생김

- 수정 시 실수 가능성 증가

- 유지보수 비용 상승

이를 피하기 위해 다음처럼 공통 함수를 만들어 리팩토링할 수 있습니다:

```ts
function getArticles(
  apiInstance: AxiosInstance,
  request: ArticleListRequestDto,
): Promise<CursorPaginationResponseDto<Article>> {
  const response = apiInstance.get('/article', { params: request });
  return response.data;
}
```

### 문제점 2. 관심사의 분산과 응집성 저하

이 방식은 중복을 줄이는 데는 유용하지만, 실질적인 문제는 **코드가 기능 단위가 아닌, 환경 단위로 분산**된다는 데 있습니다.

`Article`이라는 도메인은 `조회`, `생성`, `수정`, `삭제` 등 여러 기능으로 구성되며, 이들은 **하나의 응집된 단위로 다뤄져야** 합니다.

하지만 각 기능을 분리된 함수로 관리하고, 매번 `apiInstance`를 넘겨주는 구조는 결국 **도메인의 응집성을 해치고 관심사를 흩뜨리는 결과**를 초래합니다.

---

## DI를 통해 설계의 복잡성을 돌파하다

이런 구조적 한계를 극복하기 위해 **의존성 주입(DI)**을 적용하여 전체 아키텍처를 리팩토링했습니다.

핵심은 **도메인별로 API 호출 책임을 하나의 클래스로 응집**하고, 필요한 의존성(`axios` 인스턴스)은 외부에서 주입받는 방식입니다.

### Article 도메인에 대한 Repository 구성

```ts
// 1. 추상화 계층: Article 도메인 인터페이스
abstract class ArticleRepositoryImpl {
  abstract getAll(
    request: ArticleListRequestDto,
  ): Promise<CursorPaginationResponseDto<Article>>;
  // delete, update, create 등도 여기에 명세
}

// 2. 구현체: api 인스턴스를 주입받아 실제 호출
class ArticleRepository implements ArticleRepositoryImpl {
  constructor(private readonly api: AxiosInstance) {}

  async getAll(
    request: ArticleListRequestDto,
  ): Promise<CursorPaginationResponseDto<Article>> {
    const response = await this.api.get('/article', { params: request });
    return response.data;
  }

  // async delete(...) 등도 동일한 패턴
}
```

### 환경에 따라 주입만 다르게

```ts
export const articleRepositoryWithClient = new ArticleRepository(clientApi);

export const articleRepositoryWithServer = new ArticleRepository(serverApi);
```

사용하는 곳에서는 아래와 같이 간단하게 사용하면 됩니다.

```ts
articleRepositoryWithClient.getAll(params);

articleRepositoryWithServer.getAll(params);
```

---

## DI를 통해 얻게 된 3가지 구조적 이점

### ✅ 1. 도메인 중심의 응집된 아키텍처

`ArticleRepositoryImpl`라는 인터페이스는 Article 도메인의 모든 기능을 명확히 명세하고,

`ArticleRepository`는 이 기능들을 실제로 구현하면서 **모든 로직을 하나의 객체 내부로 응집**시킵니다.

> "Article 관련 기능은 ArticleRepository 안에 다 있다"는 구조적 일관성이 생깁니다.

---

### ✅ 2. 환경과 구현의 분리로 인한 유연성

어떤 API 인스턴스를 사용할지는 `ArticleRepository`가 아닌 외부에서 결정합니다.

`clientApi`, `serverApi`, 혹은 `mockApi` 등 어떤 인스턴스를 주입하더라도 내부 로직은 그대로 작동합니다.

> 이처럼 DI는 구현에 대한 의존을 줄이고 **인터페이스만 의존**하게 해 줍니다.

---

### ✅ 3. 중복 없는 코드, 더 쉬운 테스트

이전처럼 환경마다 `getArticlesFromClient`, `getArticlesFromServer`를 따로 만들 필요가 없습니다.

심지어 테스트할 때는 `MockApi` 같은 테스트용 인스턴스를 주입하면 됩니다.

> 테스트 시 실제 네트워크 요청 없이 ArticleRepository의 로직만 독립적으로 검증 가능해집니다.

---

## 마무리: 왜 우리는 DI를 써야 하는가?

DI는 단순한 코드 리팩토링 기법이 아니라, **설계의 방향성**을 제시하는 강력한 원칙입니다.

그 핵심은 객체가 의존성을 **스스로 생성하지 않고 외부에서 제공받는 것**에 있습니다.

이를 통해 우리는 다음과 같은 이점을 얻습니다:

- **결합도 감소:** 구현체가 아닌 추상화에 의존하게 되어, 코드 변경에 강해집니다.

- **유연성과 확장성 증가:** HTTP 클라이언트나 실행 환경이 바뀌어도 대응이 쉬워집니다.

- **재사용성과 응집도 향상:** 도메인 중심의 클래스를 다양한 컨텍스트에서 재사용할 수 있습니다.

- **테스트 용이성:** 의존성을 mock으로 바꿔 손쉽게 단위 테스트가 가능합니다.

---

이 사이드 프로젝트는 DI의 필요성과 효과를 **실전에서 제대로 느낄 수 있었던 계기**였습니다.

프레임워크가 대신 해주는 DI가 아니라, **내가 직접 설계한 DI 구조**를 만들면서 그 진정한 의미를 깊이 이해하게 되었습니다.
