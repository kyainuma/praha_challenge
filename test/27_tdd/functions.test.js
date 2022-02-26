import { add, subtract, multiply, divide } from './functions';

describe('add', () => {
  describe('正常系', () => {
    it('[3, 10, 3]を受け取った場合、16が返ること', () => {
      const args = [3, 10, 3]
      expect(add(args)).toBe(16);
    })

    it('30個の引数を受け取った場合、和が返ること', () => {
      const args = Array(30).fill(1);
      expect(add(args)).toBe(30);
    })

    it('計算結果が1000の場合、1000が返ること', () => {
      const args = [999, 1]
      expect(add(args)).toBe(1000);
    })

    it('計算結果が1000を超える場合、「too big」と文字列が返ること', () => {
      const args = [1000, 1]
      expect(add(args)).toBe('too big');
    })
  })

  describe('異常系', () => {
    it('数字以外の引数を受け取った場合、エラーが発生すること', () => {
      const args = ['test']
      expect(() => add(args)).toThrow();
    })

    it('引数が0個だった場合、エラーが発生すること', () => {
      const args = []
      expect(() => add(args)).toThrow();
    })

    it('31個以上の引数を受け取った場合、エラーが発生すること', () => {
      const args = Array(31).fill(1);
      expect(() => add(args)).toThrow();
    })
  })
})

describe('subtract', () => {
  describe('正常系', () => {
    it('[10, 3, 3]を受け取った場合、4が返ること', () => {
      const args = [10, 3, 3]
      expect(subtract(args)).toBe(4);
    })

    it('30個の引数を受け取った場合、差が返ること', () => {
      const args = Array(29).fill(1);
      args.unshift(30);
      expect(subtract(args)).toBe(1);
    })

    it('計算結果が0の場合、0が返ること', () => {
      const args = [1, 1]
      expect(subtract(args)).toBe(0);
    })

    it('計算結果がマイナスの場合、「negative number」と文字列が返ること', () => {
      const args = [1, 2]
      expect(subtract(args)).toBe('negative number');
    })
  })

  describe('異常系', () => {
    it('数字以外の引数を受け取った場合、エラーが発生すること', () => {
      const args = ['test']
      expect(() => subtract(args)).toThrow();
    })

    it('引数が0個だった場合、エラーが発生すること', () => {
      const args = []
      expect(() => subtract(args)).toThrow();
    })

    it('31個以上の引数を受け取った場合、エラーが発生すること', () => {
      const args = Array(31).fill(1);
      expect(() => subtract(args)).toThrow();
    })
  })
})

describe('multiply', () => {
  describe('正常系', () => {
    it('[3, 10, 3]を受け取った場合、90が返ること', () => {
      const args = [3, 10, 3]
      expect(multiply(args)).toBe(90);
    })

    it('30個の引数を受け取った場合、積が返ること', () => {
      const args = Array(30).fill(1);
      expect(multiply(args)).toBe(1);
    })

    it('計算結果が1000の場合、1000が返ること', () => {
      const args = [1000, 1]
      expect(multiply(args)).toBe(1000);
    })

    it('計算結果が1000を超える場合、「big big number」と文字列が返ること', () => {
      const args = [1001, 1]
      expect(multiply(args)).toBe('big big number');
    })
  })

  describe('異常系', () => {
    it('数字以外の引数を受け取った場合、エラーが発生すること', () => {
      const args = ['test']
      expect(() => multiply(args)).toThrow();
    })

    it('引数が0個だった場合、エラーが発生すること', () => {
      const args = []
      expect(() => multiply(args)).toThrow();
    })

    it('31個以上の引数を受け取った場合、エラーが発生すること', () => {
      const args = Array(31).fill(1);
      expect(() => multiply(args)).toThrow();
    })
  })
})

describe('divide', () => {
  describe('正常系', () => {
    it('[100, 10]を受け取った場合、10が返ること', () => {
      const args = [100, 10]
      expect(divide(args)).toBe(10);
    })

    it('30個の引数を受け取った場合、商が返ること', () => {
      const args = Array(30).fill(1);
      expect(divide(args)).toBe(1);
    })

    it('計算結果が少数の場合、「decimals number」と文字列が返ること', () => {
      const args = [10, 3]
      expect(divide(args)).toBe('decimals number');
    })
  })

  describe('異常系', () => {
    it('数字以外の引数を受け取った場合、エラーが発生すること', () => {
      const args = ['test']
      expect(() => divide(args)).toThrow();
    })

    it('引数が0個だった場合、エラーが発生すること', () => {
      const args = []
      expect(() => divide(args)).toThrow();
    })

    it('31個以上の引数を受け取った場合、エラーが発生すること', () => {
      const args = Array(31).fill(1);
      expect(() => divide(args)).toThrow();
    })
  })
})
