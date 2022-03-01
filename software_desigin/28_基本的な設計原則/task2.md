## 問題点
PurchaseServiceの責任が多すぎる

## 改修
```ts
interface AllPurchase {
  userId: string
}

interface PastPurchase {
  productId: string
  transaction: {
    succeeded: true
    completedAt: Date
  }
}

interface PaymentRecordRepo {
  getPurchasesBy: (userId: string) => AllPurchase[]
}

class AllPurchase {
  public constructor(private paymentRecordRepo: PaymentRecordRepo) {}

  public allPurchase(userId: string, productId: string) {
    const allPurchases = this.paymentRecordRepo.getPurchasesBy(userId)
  }
}

class PastPurchase {
  public pastPurchase(userId: string, productId: string) {
    const allPurchases = new AllPurchase()
    const pastPurchase = allPurchases.find((p) => p.productId === productId && p.transaction.succeeded)
    if (pastPurchase) {
      throw new Error('この商品はおひとりさま一品限定です！')
    }
  }
}

class Purchase {
  // 購入手続きに進む
}
```
