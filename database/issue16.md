# SQL10本ノック
## 課題1
> 1996年に3回以上注文した（Ordersが3つ以上紐づいている）CustomerのIDと、注文回数
```sql
SELECT CustomerID, COUNT(*) OrderCount FROM Orders
WHERE OrderDate BETWEEN '1996-01-01' AND '1996-12-31'
GROUP BY
  CustomerID
ORDER BY OrderCount DESC;
```

> 最もよく注文してくれたのは、どのCustomerでしょうか？
```sql
SELECT CustomerID, COUNT(*) OrderCount FROM Orders
GROUP BY
  CustomerID
HAVING
  COUNT(*) = (SELECT MAX(cnt)
              FROM
                (SELECT COUNT(*) cnt
                 FROM Orders
                 GROUP BY CustomerID) v);
```

> 過去最も多くのOrderDetailが紐づいたOrderを取得してください。何個OrderDetailが紐づいていたでしょうか？
```sql
SELECT
  OrderID, COUNT(*) OrderDetailCount
FROM
  OrderDetails
GROUP BY
  OrderID
HAVING
  COUNT(*) = (SELECT MAX(cnt)
              FROM
                (SELECT COUNT(*) cnt
                 FROM OrderDetails
                 GROUP BY OrderID) v);
```

> 過去最も多くのOrderが紐づいたShipperを特定してみてください
```sql
SELECT ShipperID, COUNT(*) ShipperCount FROM Orders
GROUP BY
  ShipperID
ORDER BY ShipperCount DESC;
```

> 売上が高い順番にCountryを並べてみましょう
```sql
SELECT ROUND(SUM(OrderDetails.Quantity * Products.Price)) sales, Customers.Country FROM Customers
INNER JOIN Orders
  ON Customers.CustomerID = Orders.CustomerID
INNER JOIN OrderDetails
  ON Orders.OrderID = OrderDetails.OrderID
INNER JOIN Products
  ON OrderDetails.ProductID = Products.ProductID
GROUP BY
  Customers.Country
ORDER BY sales DESC;
```

> 国ごとの売上を年毎に（1月1日~12月31日の間隔で）集計してください
```sql
SELECT ROUND(SUM(OrderDetails.Quantity * Products.Price)) sales, strftime('%Y', Orders.OrderDate) as OrderYear, Customers.Country
FROM Customers
INNER JOIN Orders
  ON Customers.CustomerID = Orders.CustomerID
INNER JOIN OrderDetails
 ON Orders.OrderID = OrderDetails.OrderID
INNER JOIN Products
 ON OrderDetails.ProductID = Products.ProductID
GROUP BY
  Customers.Country,
  OrderYear
ORDER BY Customers.Country;
```

> Employeeテーブルに「Junior（若手）」カラム（boolean）を追加
```sql
ALTER TABLE Employees ADD "Junior" boolean NOT NULL DEFAULT 0;
```

> 誕生日が1960年より後のEmployeeの場合は値をTRUEにする更新クエリ
```sql
UPDATE Employees
SET Junior =
    CASE
        WHEN BirthDate >= '1960-01-01' THEN 1
        ELSE 0
    END;
```

> 「long_relation」カラム（boolean）をShipperテーブルに追加してください
```sql
ALTER TABLE Shippers ADD "long_relation" boolean NOT NULL DEFAULT 0;
```

> long_relationがtrueになるべきShipperレコードを特定して
```sql
SELECT ShipperID, COUNT(*) ShipperCount FROM Orders
GROUP BY
  ShipperID
HAVING
  COUNT(*) >= 70;
```

> long_relationをtrueにしてください
```sql
UPDATE Shippers
SET long_relation = 1
WHERE ShipperID = 2;
```

> 「それぞれのEmployeeが最後に担当したOrderと、その日付を取得してほしい」
```sql
SELECT OrderID, EmployeeID, MAX(OrderDate) LatestOrderDate
FROM Orders
GROUP BY EmployeeID;
```

> Customerテーブルで任意の１レコードのCustomerNameをNULLにしてください
```sql
UPDATE Customers
SET CustomerName = NULL
WHERE CustomerID = 1;
```

> CustomerNameが存在するユーザを取得するクエリ
```sql
SELECT * FROM Customers
WHERE CustomerName IS NOT NULL;
```

> CustomerNameが存在しない（NULLの）ユーザを取得するクエリ
```sql
SELECT * FROM Customers
WHERE CustomerName IS NULL;
```

> EmployeeId=1の従業員のレコードを、Employeeテーブルから削除し
```sql
DELETE FROM Employees
WHERE EmployeeID = 1;
```

> EmloyeeId=1が担当したOrdersを表示しないクエリ
```sql
SELECT Orders.OrderID, Orders.CustomerID, Employees.EmployeeID, Orders.OrderDate
FROM Orders
INNER JOIN Employees
  ON Orders.EmployeeID = Employees.EmployeeID
ORDER BY Orders.EmployeeID;
```

> EmloyeeId=1が担当したOrdersを表示する（Employeesに関する情報はNULLで埋まる）クエリ
```sql
SELECT Orders.OrderID, Orders.CustomerID, Employees.EmployeeID, Orders.OrderDate
FROM Orders
LEFT OUTER JOIN Employees
  ON Orders.EmployeeID = Employees.EmployeeID
ORDER BY Orders.EmployeeID;
```

## 課題2
> 「WHERE」と「HAVING」二つのクエリを使えますが、それぞれの違いを教えてください。どのような時にどちらを使うべきでしょうか？
- WHERE ・・・グループ化をされる前の抽出条件を指定できる
- HAVING・・・グループ化した後の抽出条件を指定できる
- グループ化した後のデータに条件を指定したい場合はHAVINGを使う。グループ化する前のデータに条件を指定したい場合はWHERE。

> SQLの文脈においてDDL、DML、DCL、TCLとは何でしょうか？
- DDL: データ定義言語（Data Definition Language）データベースのスキーマやデータ構造を扱うコマンド
- DML: データ操作言語（Data Manipulation Language）データベースに格納されているデータを操作するために使われるコマンド
- DCL: データ制御言語（Data Control Language）パーミッションや権限に関連するコマンド
- TCL: トランザクション制御言語（Transaction Control Language）データベース内におけるトランザクションを扱うコマンド

## 課題3
- 今までの注文で20,000円？以上注文したCustomerIDと総額を取得するクエリ
[![Image from Gyazo](https://i.gyazo.com/0d0841647eadc38d113c82a3688a1b77.png)](https://gyazo.com/0d0841647eadc38d113c82a3688a1b77)

- 商品カテゴリ別売上ランキングを作成して下さい
[![Image from Gyazo](https://i.gyazo.com/8bbab964357d7e501942d8ef16926e38.png)](https://gyazo.com/8bbab964357d7e501942d8ef16926e38)

- 1996年の月別売上ランキング
[![Image from Gyazo](https://i.gyazo.com/0c9eae73f821ec8ac1564553c64680c5.png)](https://gyazo.com/0c9eae73f821ec8ac1564553c64680c5)

```sql
SELECT  Customers.CustomerID, ROUND(SUM(OrderDetails.Quantity * Products.Price)) sales FROM Customers
INNER JOIN Orders
  ON Customers.CustomerID = Orders.CustomerID
INNER JOIN OrderDetails
  ON Orders.OrderID = OrderDetails.OrderID
INNER JOIN Products
  ON OrderDetails.ProductID = Products.ProductID
GROUP BY
  Customers.CustomerID
HAVING
  ROUND(SUM(OrderDetails.Quantity * Products.Price)) > 20000
ORDER BY sales DESC;
```

```sql
SELECT  Categories.CategoryName, ROUND(SUM(OrderDetails.Quantity * Products.Price)) sales FROM Customers
INNER JOIN Orders
  ON Customers.CustomerID = Orders.CustomerID
INNER JOIN OrderDetails
  ON Orders.OrderID = OrderDetails.OrderID
INNER JOIN Products
  ON OrderDetails.ProductID = Products.ProductID
INNER JOIN Categories
  ON Products.CategoryID = Categories.CategoryID
GROUP BY
  Categories.CategoryName
ORDER BY sales DESC;
```

```sql
SELECT strftime('%Y%m', Orders.OrderDate) OrderMonth, ROUND(SUM(OrderDetails.Quantity * Products.Price)) sales
FROM Customers
INNER JOIN Orders
  ON Customers.CustomerID = Orders.CustomerID
INNER JOIN OrderDetails
 ON Orders.OrderID = OrderDetails.OrderID
INNER JOIN Products
 ON OrderDetails.ProductID = Products.ProductID
WHERE OrderDate BETWEEN '1996-01-01' AND '1996-12-31'
GROUP BY
  OrderMonth
ORDER BY sales DESC;
```
