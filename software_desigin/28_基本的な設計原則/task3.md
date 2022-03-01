## 問題点
- publicなので外部からアクセスができてしまう

```ts
class Person {
    private readonly name: string
    private readonly starWorkingAt: Date
    constructor(name: string, startWorkingAt: Date) {
        this.name = name
        this.starWorkingAt = startWorkingAt
    }

    public getName() {
        return this.name;
    }

    public getStarWorkingAt() {
        return this.starWorkingAt;
    }
}

class Company {
    public people: Person[]
    constructor(people: Person[]) {
        this.people = people
    }
}

const company = new Company([new Person('a', new Date('2021-01-01')), new Person('b', new Date('2021-01-1'))])
const firstPerson = company.people[0]

// 何らかのロジックに使用するため、Person Aの勤務開始日を取り出す
const date = firstPerson.getStarWorkingAt()

// これはエラーになる
// date.starWorkingAt = "0999-12-31T23:41:01.000Z"

// これは書き換えられてしまう
date.setFullYear(1000)

// これはエラーになる
// firstPerson.name = 'modified name'

console.log(company) // companyの中に含まれていたPerson Aの勤務開始日が変わってしまう！
```
