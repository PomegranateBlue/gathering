# R3F + Next.js 16 + React 19 트러블슈팅

## 환경

- Next.js 16.1.6
- React 19.2.3
- @react-three/fiber ^9.5.0
- three ^0.183.2
- TypeScript ^5

---

## 이슈 1: `three` 모듈 타입 선언 없음

### 증상

```
모듈 'three'에 대한 선언 파일을 찾을 수 없습니다.
암시적으로 'any' 형식이 포함됩니다.
```

### 원인

`three` 패키지가 일부 버전에서 자체 타입을 번들링하지 않음.

### 해결

```bash
npm install --save-dev @types/three
```

---

## 이슈 2: R3F JSX 요소 타입 오류

### 증상

```
'JSX.IntrinsicElements' 형식에 'mesh' 속성이 없습니다.
'JSX.IntrinsicElements' 형식에 'ambientLight' 속성이 없습니다.
```

### 원인 분석 과정

**시도 1 — `interface extends` 방식 (실패)**

```ts
// app/r3f.d.ts
import { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
```

에러: `An interface declaring no members is equivalent to its supertype.`

원인: `ThreeElements`가 `@react-three/fiber`의 public API(`index.d.ts`)에서 export되지 않음.
실제로는 `dist/declarations/src/three-types.d.ts` 내부에만 정의되어 있어서 import하면 빈 타입이 들어옴.

**시도 2 — `type =` 덮어쓰기 방식 (부분 동작, 부작용 있음)**

```ts
declare module "react" {
  namespace JSX {
    type IntrinsicElements = ThreeElements;
  }
}
```

R3F JSX 오류는 해결되지만 `div`, `span`, `button` 등 HTML 기본 태그 타입이 사라지는 부작용 발생.

**시도 3 — 내부 경로에서 직접 import (동작하지만 취약)**

```ts
import type { ThreeElements } from "@react-three/fiber/dist/declarations/src/three-types";
```

`ThreeElements`가 실제로 존재하는 경로이므로 동작함. 그러나 내부 dist 경로를 참조하므로 R3F 메이저 버전 업그레이드 시 깨질 수 있음.

### 올바른 해결책

R3F v9은 내장 Three.js 요소(`mesh`, `group`, `ambientLight` 등)의 JSX 타입을 패키지 내부에서 자동으로 등록함.
`r3f.d.ts` 파일 자체가 필요 없으며, 삭제하면 됨.

**커스텀 요소를 추가해야 할 때만** 아래 공식 패턴을 사용:

```ts
// 공식 R3F v9 패턴 (커스텀 요소 전용)
import { type ThreeElement } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    customElement: ThreeElement<typeof CustomElement>
  }
}

extend({ CustomElement })
```

### 참고

- React 19에서 global JSX namespace 방식이 deprecated됨
- React 19 업그레이드 가이드: https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript
- R3F v8.1.0부터 `ThreeElements`가 공식 인터페이스로 도입됨

---

## 이슈 3: `React.MutableRefObject` deprecated

### 증상

```
'MutableRefObject'은(는) 사용되지 않습니다. (code: 6385)
```

### 원인

React 19에서 `useRef`의 반환 타입이 `MutableRefObject<T>`에서 `RefObject<T>`로 변경됨.

### 해결

```ts
// Before (React 18)
positionRef: React.MutableRefObject<THREE.Vector3>

// After (React 19)
positionRef: React.RefObject<THREE.Vector3>
```
