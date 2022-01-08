# DBモデリング1

## 課題1
- セットメニューとお好み寿司のテーブルを分けた。理由はセットメニューのみに追加仕様がある場合などに変更しやすい
- お好み寿司の価格も寿司テーブルに持たせると同じ価格が何度もあるので別テーブルに切り出した
- 合計皿数は計算で都度求めてテーブルには含めない。現状はいらなそう。追加仕様によっては追加する。たとえばその日の注文一覧を見れる仕様にする際に合計皿数も見せたいなら都度計算はパフォーマンスが悪いので合計皿数もカラムに追加する。
  - https://teratail.com/questions/125938
  - あえて入れるなら注文テーブルに個数と皿数を集計した数を保存するカラムを追加

## 任意課題
- 論理モデルとは、システム化する業務のエンティティとリレーションを実装技術に依存しない形で行うモデリングである。
- 物理モデルとは、実装を考慮してエンティティをRDBMSのテーブルと1対1になるようモデリングしたものである。
- http://itref.fc2web.com/technology/entity_relationship_diagram.html

## 課題2
> シャリの大小も選べるようになりました。
- 寿司注文詳細テーブルにシャリサイズを追加


> 寿司ネタが毎月何個売れているのか知る必要が生じました。
- こちらも都度計算で求める法が良いと思うが、あえてもたせるなら注文テーブルに皿数の合計を集計した合計皿数テーブル。
個数を集計した合計個数カラムを追加。

## 課題3
> このお店ではお持ち帰りでの注文の他にUber Eatsを導入することにした。
> そこでその施策の効果を測るために注文毎のルート（お持ち帰り or Uber Eats）を知りたい。
- 注文テーブルに注文タイプを追加。将来的に注文の仕方によっての追加仕様があるなら注文カテゴリーテーブルにわけても良さそう？

> 顧客の来店回数を知りたい。そのために顧客は初来店時に名前と電話番号を店舗に伝える。
- 注文テーブルから名前・電話番号を切り出し、顧客テーブル追加。
- そこに来店回数をカラムを追加
- 注文テーブルに顧客IDを持たせる

# DBモデリング2

- ユーザーとワークスペースはユーザーワークスペースを通して多対多
- ユーザーとチャネルはユーザーチャネルを通して多対多
- ワークスペースは複数のチャネルを持つ
- ユーザーとチャネルはメッセージを通して多対多
- ユーザーとメッセージはスレッドメッセージを通して多対多

> メッセージとスレッドメッセージを横断的に検索できること（例えば「hoge」と検索したら、この文字列を含むメッセージとスレッドメッセージを両方とも取得できること）
メッセージとスレッドメッセージは親子関係にしているので横断検索可能

> 参加していないチャネルのメッセージ・スレッドメッセージは検索できないこと
メッセージがチャネルIDを持っているので検索ユーザーのチャネルIDで絞って検索
スレッドにもチャネルID持たせてもいいかも？親のメッセージが持っているからいらないかなと。。。

# DBモデリング3

- RDBでツリー構造を表現する方法

[![Image from Gyazo](https://i.gyazo.com/0898265e109720ca70c9a0725034564e.png)](https://gyazo.com/0898265e109720ca70c9a0725034564e)

> ディレクトリ構造は柔軟に変更可能。ディレクトリが移動してサブディレクトリになることもあり得る
上記の仕様なので閉包テーブルモデルを採用

[閉包テーブルの作り方](https://qiita.com/ymstshinichiro/items/b1825719c4fb274446cc#:~:text=%E5%89%8D%E6%8F%90%E6%9D%A1%E4%BB%B6%E3%81%A7%E3%81%99%E3%80%82-,%E9%96%89%E5%8C%85%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B,-%E3%81%A7%E3%81%AF%E3%80%81%E5%89%8D%E6%8F%90%E3%82%92)

構造テーブルは、祖先と子孫の関係しか持っていません。
親と子の関係はこのテーブルから直接知ることはできません。
しかし、構造テーブルにツリーの深さを項目として持てば、もっとシンプルなクエリで取得することができます。
対象ノードの深さ±1である祖先(子孫)を取得することで直近の要素を取得できます。

# DBモデリング4

> Slackに登録している他のユーザ（複数可）宛にリマインダーを設定できる
複数のユーザーに送信できるように送信相手をリマインダーテーブルから切り出し

> 地道に正規表現でマッチしてます。 every 12 hours なら１２時間ごと、 every 3 monthsなら3ヶ月ごとなど、リマインダーの周期を決定します
周期タイプにenumで月・曜日・日・時間を保存。周期数に周期の数字を保存。曜日の場合は1〜7を保存して日曜を1にする。

# DBモデリング5

## 課題1
- 記事テーブルは更新日が一番新しい履歴IDを持つ
- 履歴テーブルには記事IDと本文と更新日を持つ。更新日で最新履歴を判定

## 課題2

> 「後から分析したいから履歴を残しておいて」など、 分析のみの用途でも履歴データをデータベースに保存しておく必要はあるのでしょうか？
回答：保存しておく必要はない。
理由：ログファイルから解析できるから

記事IDと更新日でプライマリキーにした。更新日が一番最新の記事が最新記事になる。

* メリット: テーブルが1つしかないため、テーブル管理が楽
* デメリット1: 最新記事一覧を取得するのがめんどくさい。
* デメリット2: この記事テーブルを参照するコメントテーブルを作った際に記事を更新した際にコメントテーブルの参照IDも変更しないといけない


# データベース設計のアンチパターンを学ぶ1

## 課題1

> 上記の例では、「投稿(Post)」に紐づけられた「タグ」を表現するために、投稿テーブルに「タグ」というカラムを持ち、その中に >"tagA, tagB, tagC"といった形でカンマ区切りで格納しています
>
> この設計だとどのような問題が生じるか、説明してみてください
>
> ヒント：「もし将来こんな仕様変更があったら、どれだけ大きなスキーマ変更になるだろうか？」「今の作りだと表現できないユースケースがあるのでは？」など、具体的なケースを沢山仮定して考えてみると良いかもしれません！
- 特定のtag_idを持つ行の検索・結合が複雑になるの
  - インデックスが適用されないので、検索・結合が遅い
  - クエリが利用するミドルウェアに依存する

```sql
SELECT * FROM Posts
 WHERE
  tags LIKE '%,1,%' -- カンマ区切りの内部に1を含む
 OR
  tags LIKE '1,%' -- カンマ区切りの先頭に1を含む
 OR
  tags LIKE '%,1' -- カンマ区切りの末尾に1を含む
```

- 集約関数が使用できないため、COUNT, SUM, AVGなどの集計のクエリが複雑になる
- tagを1つ削除する場合に元のtagsと更新したtagsの保存の2操作が必要になる

## 課題3

- ブログの共同編集者の設定
  - auther_id に複数のautherのIDをいれる

- ECサイトのカート
  - カートテーブルに複数の商品IDをいれる

- チャットのワークスペースに複数のユーザーを持つアプリ
  - ユーザーのIDを複数いれる

# データベース設計のアンチパターンを学ぶ2

## 課題1
- あるタグの付いたPostを検索する場合は全てのカラムに対する条件を OR でつなぐ必要がある
- タグを既存のPostに追加するときは、どのカラムが開いているか事前に確認しなければなりません。
- 同一のタグが一つのPostに追加されてしまう
- 最大で3つしかタグ追加できない

## 課題3
- ユーザーが複数の電話番号をもつ場合にユーザーテーブルにaddress_1のようなカラムが複数ある
- 商品がカテゴリーを複数もつ場合に商品テーブルにcategory_1のようなカラムが複数ある
- ユーザーが複数のルームに入れるチャットアプリにユーザーテーブルにroom_1のようなカラムが複数ある

# データベース設計のアンチパターンを学ぶ3

## 課題1
- 外部キーの宣言が出来ないため、 参照整合性制約 を定義できない
- JOINを行う場合に動的にテーブルを選択することはできないので全てのテーブルを指定しなければいけない

## 課題3
- 管理ユーザーテーブルと一般ユーザーテーブルによってユーザを管理している時に、それらのユーザのログをユーザログテーブル(user_logs)でまとめて記録したい場合
- 記事テーブルと写真テーブルを管理している時に、どちらにも「コメント」をつけたい場合

# データベース設計のアンチパターンを学ぶ4

## 課題1
- ツリー全体、もしくはある要素のサブツリーが取得しづらい（例：あるコメントのスレッド総数などが取得できない）
  - 要素の取得に1階層ごとにJOINしないと取得できない
  - 階層がどこまであるかわからないので取得できる階層が固定される

- 子が存在する要素を削除した際に整合性を取りづらい。
  - 削除する時に参照整合性のために子要素から順に取得して削除しなければならない
  - 親:1, 子:2, 孫:3のようなデータが有り2を削除したい場合に参照整合性のために3の親を1に変更してから2を削除しなければならない
  - 論理削除なら上記の心配はない

## 課題3
- esa, notionなどの階層構造型のドキュメント管理ツール
- 掲示板アプリのスレッドコメントなど


```sql
SELECT
  c.*
FROM
  Comments c
INNER JOIN
  TreePaths t
ON
  c.id = t.descendant_id
WHERE
  t.ancestor_id = 1;
```

<h5>追加</h5>
親コメント2（ID=5）に対するコメントを追加した場合

```sql
DELETE FROM
  TreePaths
WHERE
  descendant_id IN 4;
DELETE FROM
  TreePaths
WHERE
  ancestor_id IN 4;
```

# データベース設計のアンチパターンを学ぶ5

## 課題1
> 例えば商談の数が増えたらどうなるでしょうか？
- 面談の数が増えたらレコードを新しく作るしかなく、同じ顧客なのに新しい顧客として表現するしかない。
> 仮に面談を3回実施して、1回目の面談日時を知りたい時はどうすれば良いのでしょうか？
- 現状のテーブルだけだと、1回目と3回目の顧客のつながりがないため、新しくCustomerRelationテーブルを作り、閉包モデルの形式で親子関係を保存。NewCustomerとJoinして一番若いIDの面談日時を取得
> 例えば一度成約した後に解約し、後にまた同じ人が成約したらどうなるでしょうか？
- NewCustomerに新しくレコードが登録される
## 課題3
- 求人サイト。求職者のステータスや申込日、面談日などを1テーブルで管理する


# データベース設計のアンチパターンを学ぶ6

## 課題1
- ステータスで検索しようとしても、ステータスを取得するとenum定義等を含む値が帰ってくるためそのままだと使用できない
- メタデータので意義を取得する場合はMySQLではシステムビューのinformation_schemaを検索する
```sql
SELECT
  column_type
FROM
  information_schema.columns
WHERE
  table_name = 'Student'
AND
  column_name = 'status';
+-----------------------------------+
| column_type                       |
+-----------------------------------+
| enum('在学中', '卒業', '停学中')     |
+-----------------------------------+
```

- enumの値やcheck制約を追加、削除する構文はないため新たな値の組合せで列を再定義するしかないため、新しいステータスを追加しづらい
- 値の変更に手間がかかる。
  - 既存のステータスは削除できないため、下記の3ステップが必要になる
  1. 変更後のステータスを追加
  2. 変更元のステータスを変更後のステータスに更新
  3. 変更元のステータスを削除
- データベースの種類ごとに使用が違うため、移植が困難

# データベース設計のアンチパターンを学ぶ7

## 課題1
- 常にWHERE句が必要
  - 上記の影響でdefault_scopeを使うと既存のコードにバグが出る可能性やdestroy_allをつかってしまい物理削除してしまう可能性がある。論理削除済みのものを検索する場合に難しい
  - 削除フラグを含めたユニーク制約が必要になる場合がある。右記ができていないとLIMIT 1などの場当たり的なクエリが必要になる
  - 全てのテーブルに論理削除がある場合はINNER_JOINをするとWHEREがJOINしたテーブル数必要になる
- 削除以外の状態が出たときにまた別のフラグが追加されてしまう

## 課題3
- 社員のデータを扱っているサービスで社員の退職を表現する場合

# データベース設計のアンチパターンを学ぶ8

## 課題1
- 商品コードを変更すると、商品テーブルを外部参照しているすべてのテーブル（例えば受注明細テーブル）上の商品コード値を洗い替えなければならない
- 主キーを「商品コード」から「会社コード＋商品コード」に変更した場合、商品テーブルを外部参照しているすべてのテーブルの構造に変更が必要となる

## 課題2
- 主キーを業務上は意味を持つ値ではないが、システム的に一意な値をとるようオートインクリメントなどで連番を振るサロゲートキーにする


## 課題3
- 社員を管理するサービスで社員コードを主キーにする場合

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
