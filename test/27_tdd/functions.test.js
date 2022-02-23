import { add } from './functions';

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
