# トランザクションについて理解する
## 課題1
> デッドロックを説明してください

二つのトランザクションが別々のテーブルのデータを先にロックし、
次の処理でそれぞれのトランザクションがそのロックされたデータを処理する場合に
それぞれのデータが解放されるのを待って、解放され次第処理を進めるが、お互い解放しないので、次の処理へ進めない状態

> それぞれのISOLATION LEVELについて説明してみてください。
> それぞれの差分、それによってどんな問題が生じる可能性があるでしょうか？

1. READ UNCOMMITTED
- 他のトランザクションが変更してまだコミットしていないデータを読む (Dirty Read) ことができてしまう

2. READ COMMITTED
- 他のトランザクションが変更してまだコミットしていないデータは読めない
- Dirty Read は防げるが、他のトランザクションがデータを変更することができるため、トランザクション内で同じデータを繰り返し読み込むときに値が変わってしまっている可能性がある

3. REPEATABLE READ
- 他のトランザクションが変更してまだコミットしていないデータを読むことができないようにし、かつ shared lock で他のトランザクションが現在のトランザクションが読んだデータを変更できないようにする
- READ COMMITTED と違って、このトランザクション内では同じデータは何度読み込んでも同じ値になる
- 他のトランザクションが、このトランザクション内で取得したデータの検索条件に合致するようなデータを追加することができるので、同じトランザクション内で同じクエリーでデータを複数回取得した際に、同じデータが得られない場合がある

4. SNAPSHOT
- トランザクションが開始した時にコミット済みのデータのスナップショットをトランザクション内で使用する
- トランザクションが開始した後に、他のトランザクションが変更したデータは、このトランザクションには影響を与えない
- データがロックされないので並行性は高まるが、その分リソースを使う

5. SERIALIZABLE
- 他のトランザクションはこのトランザクションが読んだデータを変更したり、このトランザクションが取得した検索条件に合致するようなデータを追加したりすることができない
- 他のトランザクションが変更してコミットされていないようなデータを読むこともできない
- 他のトランザクションの影響を受けずに、安全にデータを処理することができますが、その分並行性は低くなる
- 同じテーブル、カラム、インデックスなどを使った SERIALIZABLE 分離レベルのトランザクションが複数同時に実行されていると、処理の順番によってはデッドロックも起こりやすくなる

> 行レベルのロック、テーブルレベルのロックの違いを説明してください

- トランザクション対象のレコードのみをロックするか、テーブル全てをロックするか
- デフォルトでは、データは表レベルではなく行レベルでロックされる。行レベルでロックすると、複数のユーザーが同一の表の別の行に同時にアクセスでき、パフォーマンスが大幅に向上する

> 悲観ロックと楽観ロックの違い

- 悲観ロック
他者が同じデータに頻繁に変更を加えるであろう、という悲観的な前提の排他制御。
更新対象のデータを取得する際にロックをかけることで、他のトランザクションから更新されないようにする

- 楽観ロック
楽観ロックとは、めったなことでは他者との同時更新は起きないであろう、という楽観的な前提の排他制御。
データそのものに対してロックは行わずに、更新対象のデータがデータ取得時と同じ状態であることを確認してから更新する

## 課題2
```sql
-- Dirty Read
-- トランザクション分離レベルを READ UNCOMMITTED に変更
mysql1> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
Query OK, 0 rows affected (0.00 sec)

mysql1> SELECT @@GLOBAL.tx_isolation, @@tx_isolation;
+-----------------------+------------------+
| @@GLOBAL.tx_isolation | @@tx_isolation   |
+-----------------------+------------------+
| REPEATABLE-READ       | READ-UNCOMMITTED |
+-----------------------+------------------+
1 row in set, 2 warnings (0.00 sec)

mysql2> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
Query OK, 0 rows affected (0.00 sec)

mysql2> SELECT @@GLOBAL.tx_isolation, @@tx_isolation;
+-----------------------+------------------+
| @@GLOBAL.tx_isolation | @@tx_isolation   |
+-----------------------+------------------+
| REPEATABLE-READ       | READ-UNCOMMITTED |
+-----------------------+------------------+
1 row in set, 2 warnings (0.00 sec)

-- トランザクションを開始
mysql1> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

mysql2> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

-- 片方のトランザクションでレコード更新
mysql1> UPDATE departments SET dept_name = 'Customer Service' WHERE dept_no = 'd009';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

-- コミット前にもう一方のトランザクションからレコードを確認
mysql2> SELECT * FROM departments WHERE dept_no = 'd009';
+---------+------------------+
| dept_no | dept_name        |
+---------+------------------+
| d009    | Customer Service |
+---------+------------------+
1 row in set (0.00 sec)


-- Non-repeatable read
-- トランザクション分離レベルを READ COMMITTED に変更
mysql1> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
Query OK, 0 rows affected (0.00 sec)

mysql1> SELECT @@GLOBAL.tx_isolation, @@tx_isolation;
+-----------------------+----------------+
| @@GLOBAL.tx_isolation | @@tx_isolation |
+-----------------------+----------------+
| REPEATABLE-READ       | READ-COMMITTED |
+-----------------------+----------------+
1 row in set, 2 warnings (0.00 sec)

mysql2> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
Query OK, 0 rows affected (0.00 sec)

mysql2> SELECT @@GLOBAL.tx_isolation, @@tx_isolation;
+-----------------------+----------------+
| @@GLOBAL.tx_isolation | @@tx_isolation |
+-----------------------+----------------+
| REPEATABLE-READ       | READ-COMMITTED |
+-----------------------+----------------+
1 row in set, 2 warnings (0.00 sec)

-- トランザクションを開始
mysql1> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

mysql2> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

-- 片方のトランザクションでレコード更新
mysql1> UPDATE departments SET dept_name = 'Customer' WHERE dept_no = 'd009';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

-- コミット前にもう一方のトランザクションからレコードが更新されていないことを確認
mysql2> SELECT * FROM departments WHERE dept_no = 'd009';
+---------+------------------+
| dept_no | dept_name        |
+---------+------------------+
| d009    | Customer Service |
+---------+------------------+
1 row in set (0.00 sec)

-- コミット後に確認
mysql1> COMMIT;
Query OK, 0 rows affected (0.00 sec)

mysql2> SELECT * FROM departments WHERE dept_no = 'd009';
+---------+-----------+
| dept_no | dept_name |
+---------+-----------+
| d009    | Customer  |
+---------+-----------+
1 row in set (0.00 sec)

-- Phantom read
-- トランザクション分離レベルは READ COMMITTED で実行
mysql1> SELECT @@GLOBAL.tx_isolation, @@tx_isolation;
+-----------------------+----------------+
| @@GLOBAL.tx_isolation | @@tx_isolation |
+-----------------------+----------------+
| REPEATABLE-READ       | READ-COMMITTED |
+-----------------------+----------------+
1 row in set, 2 warnings (0.00 sec)

mysql2> SELECT @@GLOBAL.tx_isolation, @@tx_isolation;
+-----------------------+----------------+
| @@GLOBAL.tx_isolation | @@tx_isolation |
+-----------------------+----------------+
| REPEATABLE-READ       | READ-COMMITTED |
+-----------------------+----------------+
1 row in set, 2 warnings (0.00 sec)

-- トランザクションを開始
mysql1> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

mysql2> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

-- 片方のトランザクションでレコードを削除
mysql1> DELETE FROM employees WHERE emp_no = 500000;
Query OK, 1 row affected (0.00 sec)

-- コミット前にもう一方のトランザクションからレコードが削除されていないことを確認
mysql2> SELECT * FROM employees WHERE emp_no = 500000;
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
| 500000 | 1995-04-08 | Yasunari   | Kainuma   | M      | 2022-01-23 |
+--------+------------+------------+-----------+--------+------------+
1 row in set (0.00 sec)

-- コミット後に確認
mysql1> COMMIT;
Query OK, 0 rows affected (0.00 sec)

mysql2> SELECT * FROM employees WHERE emp_no = 500000;
Empty set (0.00 sec)
```

## 課題3
- ある一方の処理で共有ロックをかけたとき、もう一方の処理で共有ロックをかけることはできますか？
- ある一方の処理で排他ロックをかけたとき、もう一方の処理で排他ロックをかけることはできますか？
- ある一方の処理で排他ロックが失敗しました。かかっている可能性があるロックを列挙して下さい
