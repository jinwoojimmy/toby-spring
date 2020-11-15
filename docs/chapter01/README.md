# chapter1(오브젝트와 의존관계)

## 들어가며

- 스프링을 잘 사용하려면, 스프링 컨테이너를 다루는 방법과 설정정보를 작성하는 방법을 알아야 한다.
- 스프링이 제공하는 3가지 핵심 프로그래밍 모델
    1. **IoC/DI** : 프레임워크의 근간.
    2. **서비스 추상화** : 구체적인 기술과 환경에 종속되지 않도록 유연한 추상 계층을 둔다.
    3. **AOP** : 산재해서 나타나는 부가적인 기능을 독립적으로 모듈화하는 프로그래밍 모델.
- 스프링 통해 얻게 되는 두 가지 중요한 가치
    1. **단순함** : **기존 EJB**라는 강한 권위 가졌던 표준 기술 비판하며 등장.
    스프링이 강력히 주장하는 것은 가장 단순한 객체지향적 개발 모델인 **POJO 프로그래밍**
    2. **유연성** : 다른 많은 프레임워크와 편리하게 접목되어 사용가능. a.k.a glue 프레임워크.

---

스프링은, 객체지향 프로그래밍이 제공하는 폭넓은 혜택을 누리도록 기본으로 돌아가는 것을 핵심 가치로 둔다.

그런 점에서 **오브젝트**는 스프링에서 관심을 가장 많이 두는 대상이다. ****생성, 관계, 사용, 소멸에 대한 생각을 하게 되면, 객체지향 설계 기초와 원칙을 비롯해서 디자인 패턴, 리팩토링 그리고 단위 테스트와 같은 오브젝트 설계와 구현에 관한 여러 응용 기술과 지식이 요구된다.

## 1.1 초난감 DAO

cf. 자바빈 : 디폴트 생성자, 프로퍼티 with getter/setter

- 예제 step0)
내용 : add, get에 대해서 "연결 - 준비 - 실행 - 자원해제" 중복 코드.

## 1.2 DAO의 분리

- 관심사의 분리(Separation of Concerns) : 한 가지 관심이 한 관심에 집중. 관심이 다른 것은 따로 떨어져 있게 하는 것.
- **step1)** Connection 만들기 추출
적용 방식 : refactoring ; 기능 영향 주지 않으면서 깔끔하게 구조만 변경, extract method ; 공통 기능 추출. 독립된 메서드 분리.
 내용 : getConnection() 메서드 분리해서, add와 get 메서드에서 공통으로 사용.
→ 관심 내용이 독립적으로 존재해서, 수정이 간단해짐.

- 요구사항의 추가 ; UserDao는 바이너리 파일만 제공해줄 때
**step2)** abstract class UserDao 만들고, 로직 흐름은 만들고, 추상 메서드는 서브 클래스 구현에 맡김.
// 템플릿 메소드 패턴, 팩토리 메소드 패턴
한 마디로 내용 : UserDao에 팩토리 메소드 패턴 적용해서, getConnection() 분리
→ 연결 기능과 사용자 정보 저장/조회 기능 '변화의 성격'에 따라 분리
    - 변화의 성격이 다르다 : 변화의 이유와 시기, 주기 등이 다름!
        - 상속을 사용해서 너무 밀접, UserDao가 상속하는 것이 있다면 불가.

## 1.3 DAO의 확장

step2에서, 추상 클래스를 만들고, 상속한 서브 클래스에서 변화가 필요한 부분을 바꿔쓰도록 한 이유는, 변화의 성격이 다른 것을 분리해서, 서로 영향을 주지 않은 채로 각각 필요한 시점에 독립적인 변경을 하게 하기 위함이었다. 그러나 상속이라는 단점많은 방식을 썼다.
→ 상하위 클래스를 만들었던 것에 대해, 독립적인 클래스를 만들어 보자!

**클래스 분리 1st 시도 step3)**
// 목표 : 상속에서 벗어나기

UserDAO → SimpleConnectionMaker

- 문제
    - 메서드 모두 수정해야함ㅗ
    - DB 커넥션 제공하는 클래스가 어떤 것인지 UserDao가 알고 있어야함.

**클래스 분리 2nd 시도 step4)**
// 핵심 : 인터페이스 사용
**-** UserDao → ConnectionMaker interface
- NConnectionMaker DConnectionMaker implements ConnectionMaker

- 문제 : UserDao 안에서 Connection 구현체 클래스 생성 호출 ; **관계 설정 별도 위임 필요**

```java
public UserDao() {
  this.connectionMaker = new DConnectionMaker();
}
// 이 자체가 찗지만, 충분히 독립적인 관심사다!
// → UserDao와 UserDao가 사용할 ConnectionMaker의 특정 구현체 사이 관계 설정!!
// 분리하지 않으면 UserDao는 결코 독립적 확장 불가.
```

**step5)**

이제는 UserDao의 클라이언트에게 런타임 오브젝트 관계를 갖는 구조로 만들어주는 책임을 넘겨보자.

- 오브젝트 사이 관계는 클래스 사이 관계와 다르다. 코드에 보이지 않던 관계가 오브젝트로 만들어진 후 성립되는 관계!
EX> UserDao → DConnectionMaker
- UserDao의 관심/책임도 아닌 것을, 클라이언트에게!

```java
public class UseerDaoTest {

  public static void main(String[] args) throws ClassNotFoundException, SQLException {
    // UserDao가 사용할 ConnectionMaker 구현 클래스를 결정하고 오브젝트 만든다
    ConnectionMaker connectionMaker = new DConnectionMaker();
    // 1 UserDao 생성, 2 사용할 ConnectionMaker 타입의 오브젝트 제공; 오브젝트 사이 의존관계 설정
    UserDao dao = newe UserDao(connectionMaker);
  }
}
```

### 지금까지 본 원칙과 패턴

- OCP(개방 폐쇄 원칙) : 클래스나 모듈은 확장에는 열려 있어야 하고, 변경에는 닫혀 있어야 한다.
- 높은 응집도 : 변경이 일어날 때 모듈의 많은 부분이 함께 바뀐다면 응집도가 높다고 할 수 있다.
ex> DB 연결방식 변경 검증한다면, ConnectionMaker 구현 클래스만 체크하면 된다.
- 낮은 결합도 : 높은 응집도보다 더 민감한 원칙. 느슨한 연결은 관계를 유지하는 데 꼭 필요한 최소한의 방법만 간접적인 형태로 제공하고, 나머지는 서로 독립적이고 알 필요도 없게 만드는 것.
- 결합도 : 하나의 오브젝트가 변경이 일어날 때에 관게를 맺고 있는 다른 오브젝트에게 변화를 요구하는 정도
- 전략 패턴 : 자신의 기능의 맥락에서, 필요에 따라 구체적인 알고리즘 클래스(책임 분리가능 클래스)를 필요에 따라 바꿔서 사용할 수 있게 하는 디자인 패턴. 클라이언트가 컨텍스트에 사용할 전략을 컨텍스트의 생성자를 통해 제공하는 게 일반적.

## 1.4 제어의 역전 (IoC)

이전까지 해온 것 잠시 돌아보면, UserDaoTest에서는 테스트를 넘어서, 관계 설정하는 역할도 갖고 있다!

두 개 오브젝트가 연결돼서 사용될 수 있도록 관계 설정하는 것도 분리해보자.

**팩토리** : 객체의 생성 방법을 결정하고 그렇게 만들어진 오브젝트를 돌려주는 역할 담당.

```java
public class DaoFactory {
  public UserDao userDao() {
     ConnectionMaker connectionMaker = new DConnectionMaker();
     UserDao userDao = new UserDao(connectionMaker);
     return userDao;
  }
}

public class UseerDaoTest {

  public static void main(String[] args) throws ClassNotFoundException, SQLException {
  
    UserDao dao = new DaoFactory().userDao();
  }
}
```

→ 애플리케이션의 컴포넌트 역할을 하는 오브젝트와, ; Client, UserDao, ConnectionMaker

애플리케이션의 구조를 결정하는 오브젝트를 분리했다! ; DaoFactory

### 제어의 역전

프로그램의 제어 흐름 구조가 바뀌는 것!

오브젝트가 자신이 사용할 오브젝트를 스스로 선택하지 않는다.

모든 제어 권한을 자신이 아닌 다른 대상에게 위임한다.

- 디자인 패턴에서의 예시 - 템플릿 메서드 패턴
제어권을 상위 템플릿 메소드에 넘기고, 자신은 필요할 때 호출되어 사용된다.

- 라이브러리 vs 프레임워크 : 라이브러리를 사용하는 애플리케이션 코드는 애플리케이션 흐름을 직접 제어. 반면, 프레임워크는 애플리케이션 코드가 프레임워크에 의해 사용된다.

## 1.5 스프링의 IoC

스프링의 핵심을 담당하는 것 : 빈 팩토리 혹은 애플리케이션 컨텍스트
; 우리가 만든 DaoFactory가 하는 일을 좀 더 일반화한 것이다.

- 빈 : 스프링이 제어권을 가지고 직접 만들고 관계를 부여하는 오브젝트

### 애플리케이션 컨텍스트

- 빈의 생성과 관계설정 같은 제어를 담당하는 IoC 오브젝트
- 별도의 정보를 참고해서 빈(오브젝트)의 생성, 관계설정 등의 제어 작업을 총괄한다.

## 스터디관련#1



### 추가로 알아보게 된 것

- 스프링의 모든 기술은 JavaEE에 기반
→ JavaEE?
- 기존 EJB ; 자바 EE 기술의 혼란 - 기존 문제는 구체적으로 무엇일까?
[https://okky.kr/article/415474](https://okky.kr/article/415474)
    - EBJ는 JavaEE의 핵심
        - 미들웨어에 필요한 공통 API를 제공하는 컨셉으로 만들어짐.
        - ↔ Servlet, JSP는 웹  GUI위해 필요.
        - 실용성보다는 API 모양새, 플랫폼 독립성이라는 자바 특성만 강조하여 설계해서 불편한 점 많음.
            - 미들웨어 종속을 극복하기 위해 만들었으나, 자바EE 서버 제품에 종속되어 버리는 아이러니한 상황 발생
            - 당시에는 '의미있는 기본값' 혹은 '설정보다는 관행' 같은 사상이 널리 쓰이기 이전 ; xml 지옥
    - 스프링
        - 풀스택 서버가 아닌 서블릿 컨테이너에서 구동
        - 스프링을 통해 비싼 자바EE 서버를 구매하지 않아도 **EJB보다 훨씬 간편한 방식**으로 EJB가 제공하던 선언적 트랜잭션 및 보안 처리, 분산 환경 지원 등 주요 기능을 모두 사용할 수 있게 되었음을 뜻하며, 무엇보다 이제는 더 이상 각 자바EE 서버 제품에 특화된 설정을 따로 공부하거나 서버 제품을 바꿀 때마다 포팅 작업이 필요없이 스프링만 이용하면 탐캣이든 레진(Resin)이든 기존의 풀스택 자바EE 서버이든 관계없이 **간단하게 배포**가 가능하다
- POJO 프로그래밍
Plain Old Java Object, 간단히 POJO는 말 그대로 해석을 하면 오래된 방식의 간단한 자바 오브젝트라는 말로서 Java EE 등의 중량 프레임워크들을 사용하게 되면서 해당 프레임워크에 종속된 "무거운" 객체를 만들게 된 것에 반발해서 사용되게 된 용어
- 스프링 창립자의 철학?

### 만들어본 질문

- 오브젝트 팩토리 대비, 어플리케이션 컨텍스트 사용시의 장점은?

1 클라이언트는 구체적인 팩토릴 클래스를 알 필요가 없다
2 애플리케이션 컨텍스트는 통합 IoC서비스를 제공해준다.
3 애플리케이션 컨텍스트는 빈을 검색하는 다양한 방법을 제공한다.
- 낮은 결합도, 높은 응집도 설명 ; 우리 봤던 클래스 예시로 들어서!

[2020.11.09 (월) 1회 스터디 나눈 점 정리](review1.md)


## 1.6 싱글톤 레지스트리와 오브젝트 스코프

### 오브젝트 팩토리와 애플리케이션 컨텍스트의 차이

- 오브젝트의 동일성과 동등성
    - 동일성 : == . identity 비교
    - 동등성 : equal. equality 비교.
- → 스프링은 여러 번에 걸쳐 빈을 요청하더라도, 매번 동일한 오브젝트를 돌려준다.
오브젝트 팩토리의 경우, 반환하는 오브젝트 동일하지 않다.

### 싱글톤 레지스트리로서의 애플리케이션 컨텍스트

애플리케이션 컨텍스트는 싱글톤을 저장하고 관리하는 싱글톤 레지스트리(singleton registry)

- 왜 싱글톤으로 빈을 만들게 되었을까?
    - 엔터프라이즈 시스템을 위해 고안된 기술이기에, 서버 환경에서 활용될 때 가치가 있다.
        - 높은 성능 요구
        - 매번 새로 생성 시, 부하.
    - "서비스 오브젝트" 라는 개념은 엔터프라이즈 분야에서 일찍부터 사용됨. 서블릿이 대표적 예.
    여러 쓰레드에서 하나의 오브젝트를 공유해 동시에 사용,

### 싱글톤 패턴의 한계

<기본 구조>

```java
public class UserDao {
  // 생성된 싱글톤 오브젝트 저장하기 위해 자신과 같은 타입의 스태틱 필드
	private static UserDAO INSTANCE;
	// 외부 생성 막기 위해 private 생성자
	private UserDao(ConnectionMaker connectionMaker) {
		this.connectionMaker = connectionMaker;
	}
	// 스태틱 팩토리 메소드
	public static synchronized UserDao getInstance() {
		if (INSTANCE == null) INSTANCE = new UserDao(??);
		return INSTANCE;
	}
 ...
}
```

<문제점>

1. private 생성자 있어서 상속 불가 - 객체지향의 장점인 상속과 다형성 활용 불가
2. 싱글톤은 테스트하기 어려움
3. 서버환경에서는 싱글톤이 하나만 만들어지는 것 보장 어려움. ; 서버에서 클래스 로더 어떻게 구성하느냐, JVM에 분산되어 설치되는 경우에도 오브젝트 독립적으로 생김
4. 싱글톤의 사용은 전역 상태를 만들 수 있음.

### 싱글톤 레지스트리

- 싱글톤 레지스트리의 장점 :
    1. static method, private 생성자가 없는, 평범한 클래스를 싱글톤으로 활용할 수 있게 해준다.
    2. 테스트 자유롭고, mock 으로 대체도 간단.
    3. **(중요) 스프링이 지지하는 객체지향적 설계 + 디자인 패턴 등 적용하는 데 제약 없다.**

### 싱글톤 주의사항

1. 멀티스레드 환경에서 서비스 형태의 오브젝트로 사용되는 경우, 상태정보를 내부에 갖고 있지 않은 무상태(stateless) 방식으로 만들어져야 한다.
→ 기본적으로 인스턴스 필드의 값을 변경하고 유지하는 상태유지(stateful) 방식으로 만들지 않는다.
물론 읽기전용의 값이라면, 초기화 시점에서 인스턴스 변수에 저장해두고 공유하는 것은 문제없다.
2. 각 요청에 대한 값을 반환할 때는, 파라미터, 로컬 변수, 리턴 값등을 활용.
그래서 여러 스레드가 변수의 값을 덮어쓰는 일을 없도록 한다.

## 1.7 의존관계 주입(DI)

### IoC와 DI

- **IoC** : 매우 폭넓게 사용되는 용어.
    - 서비스 컨테이너? 템플릿 메소드 패턴을 이용해 만들어진 프레임워크? 다른 IoC 특징 지닌 기술?
    ; 의미 불명확
- **DI** : 스프링이 제공하는 IoC방식을 핵심을 짚어주는, '**의존관계 주입**' 이라는 뜻의 용어 등장.
기본적으로 동작원리는 IoC방식이나, 다른 프레임워크와 차별화되어 제공해주는 기능!
+) DI는 오브젝트 레퍼런스를 외부로부터 주입받고 이를 통해 여타 오브젝트와 다이내믹하게 의존관계가 만들어지는 것이 핵심이다.

### 런타임 의존관계 설정

- 의존관계 : 한쪽인 변화가 다른 쪽에 영향을 주는 것. 의존관계에는 방향성이 있다. A가 B에 의존한다면, B는 A의 변화에 영향받지 않는다.
- '의존관계 주입' 은 다음 3가지 조건을 충족하는 작업.
    1. 클래스 모델이나 코드에는 런타임 시점의 의존관계가 드러나지 않는다. 그러기 위해 인터페이스에만 의존.
    2. 런타임 시점의 의존관계는 컨테이너나 팩토리같은 **제 3의 존재**가 결정.
    ; 스프링 어플리케이션 컨텍스트, 빈 팩토리, IoC 컨테이너 등이 모두 외부에서 오브젝트 사이의 런타임 관계를 맺어주는 책임을 지닌 **제 3의 존재**다,
    3. 의존관계는 사용할 오브젝트에 대한 레퍼런스를 외부에서 제공(주입)해줌으로 만들어진다.

    - 자바에서 오브젝트에 무엇인가를 넣어준다는 개념은, 메소드를 실행하면서 파라미터로 오브젝트의 레퍼런스를 전달해주는 방법뿐이다. 가장 쉬운 사용 방법은 생성자다.

    ```java
    /*  의존관걔 주입위한 코드 */
    public class UserDao {
    	private ConnectionMaker connectionMaker;

    	public UserDao(ConnectionMaker connectionMaker) {
    		this.connectionMaker = connectionMaker;
    	}
    }
    /*
    생성자를 통해 주입받은 DConnectionMaker 오브젝트를 언제든지 사용하면 된다.
    **/
    ```

    - DI컨테이너에 의해 런타임 시에 의존 오브젝트를 사용할 수 있도록 그 레퍼런스를 전달받는 과정이 마치 메소드(생성자)를 통해 DI컨테이너가 UserDao에게 주입해주는 거 같다고 해서, 의존관계 주입이라고 부른다.
    - DI는 자신이 사용할 오브젝트에 대한 선택과 생성 제어권을 외부로 넘기고, 자신은 수동적으로 주입받은 오브젝트를 사용한다는 점에서 IoC의 개념에 잘 들어맞는다. 스프링 컨테이너의 IoC는 주로 의존관계 주입 또는 DI라는 데 초점이 맞춰져 있다. 그래서 스프링을 IoC컨테이너 외에도 DI컨테이너 또는 DI 프레임워크라고 부르는 것이다.

    ### 의존관계 검색과 주입

    - 의존관계 검색 : 런타임 시 의존관계를 맺을 오브젝트를 결정하는 것과 오브젝트의 생성 작업은 외부 컨테이너에게 IoC로 맡기지만, 이를 가져올 때는 메소드나 생성자를 통한 주입 대신 스스로 컨테이너에게 요청하는 방법을 사용한다.
    - ex>

    ```java
    public UserDao() {
    	AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(DaoFactory.class);
    	this.connectionMaker = context.getBean("connectionMaker", ConnectionMaker.class);
    }
    ```

    - 의존관계 검색 방법은 코드 안에 오브젝트 팩토리 클래스나 스프링 API가 드러난다. 애플리케이션 컴포넌트가 컨테이너와 같이 성격이 다른 오브젝트에 의존하게 되는 것이므로 그다지 바람직하지 않다. 대개는 의존관계 주입 방식을 사용하는 편이 낫다.

    - **의존관계 검색과 주입의 중요한 차이점** :  의존관계 검색 방식에서는 검색하는 오브젝트는 자신이 스프링의 빈일 필요가 없다. 의존관계 주입에서는 DI를 원하는 오브젝트는 먼저 자신이 컨테이너가 관리하는 빈이 되어야 한다.
    - DI 기술의 장점
        1. 코드에 런타임 클래스에 대한 의존관계 X ;  결합도 낮춤
        2. 변경을 통한 다양한 확장 방법에 자유롭다.
        ex> 로컬db, 개발db, 상용db interface만 맞추면 자유롭게 바꿔낄 수 있다.

    ### 메소드를 이용한 의존관계 주입

    반드시 생성자 주입해야하는 것은 아님~

    - setter ; 메서드 이용 DI 중 많이 사용되는 방식.
    - 일반 메소드 ; 파라미터 많아지고 비슷한 타입 여러 개라면 실수하기 쉬움.

    ## 1.8 XML을 이용한 설정

    스프링은 자바 클래스를 이용하는 방법 외에도, 다양한 방법으로 DI 의존관계 설정정보 만들 수 있다. 대표적인 것이 XML이다. 스키마나 DTD를 이용해서, 정해진 포맷을 따라 작성되었는지 손쉽게 확인할 수도 있다.

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd 
           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

    	<bean id="dataSource"
    		class="org.springframework.jdbc.datasource.SimpleDriverDataSource">
    		<property name="driverClass" value="com.mysql.jdbc.Driver" />
    		<property name="url" value="jdbc:mysql://localhost/springbook" />
    		<property name="username" value="spring" />
    		<property name="password" value="book" />
    	</bean>

    	<bean id="userDao" class="springbook.user.dao.UserDao">
    		<property name="dataSource" ref="dataSource" />
    	</bean>
    </beans>
    ```

    - value에 문자열 넣지만, Class 타입으로 바뀌어 설정되는 이유는, 내부적으로 이런 것이 일어나기 때문.

        ```java
        Class driverClass = Class.forName("com.mysql.jdbc.Driver");
        dataSource.setDriverClass(driverClass);
        ```

## 공부 정리

### 중요 질문

- 의존 관계 주입이 충족하는 세 가지 조건의 작업
- 싱글톤 레지스트리의 장점은?

### 추가로 알아본 것

- 빈 스코프
[https://www.tutorialspoint.com/spring/spring_bean_scopes.htm](https://www.tutorialspoint.com/spring/spring_bean_scopes.htm)

    > As a rule, use the prototype scope for all state-full beans and the singleton scope for stateless beans.

- xml 검증시 dtd, schema
[https://stackoverflow.com/questions/1544200/what-is-difference-between-xml-schema-and-dtd](https://stackoverflow.com/questions/1544200/what-is-difference-between-xml-schema-and-dtd)
- 서버에서 클래스 로더 구성?
    - 하나의 파일에 대해 여러 개의 버전을 동시에 사용하고 싶을 때, 클래스 로더를 복수개 사용할 수 있다.
    - 클래스 로더 심화
    [https://www.baeldung.com/java-classloaders](https://www.baeldung.com/java-classloaders)
    [https://d2.naver.com/helloworld/1230](https://d2.naver.com/helloworld/1230)

        ```java
        import com.sun.javafx.binding.Logging;
        import java.util.ArrayList;

        public class ClassLoaderTest {
            
            public static void main(String[] args) {
                // sun.misc.Launcher$AppClassLoader@18b4aac2 - System
                System.out.println(ClassLoaderTest.class.getClassLoader());
                // sun.misc.Launcher$ExtClassLoader@60e53b93 - Extension
                System.out.println(Logging.class.getClassLoader());
                // null - Bootstrap
                System.out.println(ArrayList.class.getClassLoader());
            }
        }
        ```
