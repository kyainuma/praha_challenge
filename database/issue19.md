## 課題1
スロークエリの設定
```sql
-- スロークエリログを有効
SET GLOBAL slow_query_log = ON;

-- 0.1秒以上かかったクエリをスロークエリログに記録
SET GLOBAL long_query_time = 0.1;

-- 設定確認
SHOW VARIABLES LIKE 'long_query_time%';
	+-----------------+----------+
	| Variable_name   | Value    |
	+-----------------+----------+
	| long_query_time | 0.100000 |
	+-----------------+----------+
```

実行時間0.1秒以下のクエリ
```sql
mysql> SELECT * FROM employees WHERE emp_no = 10001;
1 row in set (0.00 sec)

mysql> SELECT * FROM employees WHERE birth_date='1953-09-02';
63 rows in set (0.00 sec)

mysql> SELECT * FROM employees WHERE last_name='Tsukuda' AND first_name='Sachin';
2 rows in set (0.00 sec)
```

実行時間が0.1秒より長いクエリ
```sql
mysql> SELECT * FROM salaries WHERE salary=40000;
95373 rows in set (0.90 sec)

mysql> SELECT * FROM salaries WHERE DATE_FORMAT(from_date, '%Y') > 2002;
Empty set (1.64 sec)

mysql> SELECT * FROM employees WHERE last_name LIKE '%sukud%';
185 rows in set (0.11 sec)
```

スロークエリログ
```sql
# Time: 2022-01-28T00:26:34.394397Z
# User@Host: root[root] @ localhost []  Id:     4
# Query_time: 2.831444  Lock_time: 0.000212 Rows_sent: 95373  Rows_examined: 95373
SET timestamp=1643329594;
SELECT * FROM salaries WHERE salary=40000;

# Time: 2022-01-28T00:26:50.092931Z
# User@Host: root[root] @ localhost []  Id:     4
# Query_time: 1.641395  Lock_time: 0.000220 Rows_sent: 0  Rows_examined: 2844047
SET timestamp=1643329610;
SELECT * FROM salaries WHERE DATE_FORMAT(from_date, '%Y') > 2002;

# Time: 2022-01-28T00:34:54.464366Z
# User@Host: root[root] @ localhost []  Id:     4
# Query_time: 0.110967  Lock_time: 0.000216 Rows_sent: 185  Rows_examined: 300024
SET timestamp=1643330094;
SELECT * FROM employees WHERE last_name LIKE '%sukud%';
```

## 課題2
```shell
# 最も頻度高くスロークエリに現れるクエリ
➤ mysqldumpslow -s c -t 1 /opt/homebrew/var/mysql/*-slow.log

Reading mysql slow query log from /opt/homebrew/var/mysql/*-slow.log
Count: 4  Time=0.12s (0s)  Lock=0.00s (0s)  Rows=27801.5 (111206), root[root]@localhost
  SELECT * FROM employees WHERE last_name LIKE 'S'

# 実行時間が最も長いクエリ
➤ mysqldumpslow -s t -t 1 /opt/homebrew/var/mysql/*-slow.log

Reading mysql slow query log from /opt/homebrew/var/mysql/*-slow.log
Count: 2  Time=1.86s (3s)  Lock=0.00s (0s)  Rows=95373.0 (190746), root[root]@localhost
  SELECT * FROM salaries WHERE salary=N

# ロック時間が最も長いクエリ
➤ mysqldumpslow -s l -t 1 /opt/homebrew/var/mysql/*-slow.log

Reading mysql slow query log from /opt/homebrew/var/mysql/*-slow.log
Count: 4  Time=0.12s (0s)  Lock=0.00s (0s)  Rows=27801.5 (111206), root[root]@localhost
  SELECT * FROM employees WHERE last_name LIKE 'S'
```

## 課題3
### 最も頻度高く発生するスロークエリとクエリを高速化するインデックスを作成
```sql
mysql> create index last_name_index on employees(last_name);

-- 後方一致が含まれているからインデックスが使用されない
mysql> explain SELECT * FROM employees WHERE last_name LIKE '%sukud%';
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra       |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
|  1 | SIMPLE      | employees | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 292247 |    11.11 | Using where |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
1 row in set, 1 warning (0.00 sec)

-- 前方一致でも使われない
mysql> explain SELECT * FROM employees WHERE last_name LIKE '%sukuda';
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra       |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
|  1 | SIMPLE      | employees | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 292247 |    11.11 | Using where |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
1 row in set, 1 warning (0.00 sec)

-- ワイルドカードがあるとインデックスが使用されない？
mysql> explain SELECT * FROM employees WHERE last_name LIKE 'Tsukuda';
+----+-------------+-----------+------------+-------+-----------------+-----------------+---------+------+------+----------+-----------------------+
| id | select_type | table     | partitions | type  | possible_keys   | key             | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+-----------+------------+-------+-----------------+-----------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | employees | NULL       | range | last_name_index | last_name_index | 50      | NULL |  185 |   100.00 | Using index condition |
+----+-------------+-----------+------------+-------+-----------------+-----------------+---------+------+------+----------+-----------------------+
1 row in set, 1 warning (0.00 sec)
```

### 実行時間が最も長いスロークエリとクエリを高速化するインデックスを作成
```sql
mysql> create index salary_index on salaries(salary);

mysql> explain SELECT * FROM salaries WHERE salary=40000;
+----+-------------+----------+-----------------------------------------------------------------------------+------+---------------+--------------+---------+-------+-------+----------+-------+
| id | select_type | table    | partitions                                                                  | type | possible_keys | key          | key_len | ref   | rows  | filtered | Extra |
+----+-------------+----------+-----------------------------------------------------------------------------+------+---------------+--------------+---------+-------+-------+----------+-------+
|  1 | SIMPLE      | salaries | p01,p02,p03,p04,p05,p06,p07,p08,p09,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19 | ref  | salary_index  | salary_index | 4       | const | 95373 |   100.00 | NULL  |
+----+-------------+----------+-----------------------------------------------------------------------------+------+---------------+--------------+---------+-------+-------+----------+-------+
1 row in set, 1 warning (0.00 sec)
```

## 課題4
> １件しか取得しないのに、どうして時間かかるんですか？

最初に条件にあう全てのレコードを取得してから1件にしぼりこんでいるため

> このクエリをONで書いた方がいい理由ってあるんですかね・・・？

将来のシステム変更で外部結合に変わった時に意図しないデータを取得してしまう可能性があるから

> そもそも、JOIN WHEREで絞るのとJOIN ONで絞るのって、一体何が違うんですか？

JOIN WHEREは結合後に絞り込み、JOIN ONは結合前に絞り込むため、内部結合の場合はJOIN WHERE, JOIN ONで書いても結果は同じになるが、
外部結合の場合はJOIN WHEREでは条件に合致しないデータが除外され、JOIN ONの場合は条件に合致しないデータもNULLとなり取得される。


## 課題5
### メリット
- オフセットページネーションはすべてのデータがスキャンされるが、カーソル・ページネーションは一つ一つスキャンせず跳ばして辿り着けるのでクエリの実行が速くなる（インデックスが正確に貼られている場合）
- whereをクエリで使用しているためデータが重複したり不足したりするようなことは起きないため、書き込みが頻繁に行われるデータには適切

### デメリット
- ページ番号を表示するページネーションができない
- 複数のソートのオプションがある場合、複数のカラムにインデックスを貼る必要がある
- カーソル・ページネーションのwhere句の条件で使われるカラムはユニークである必要がある

https://note.com/tomo_program/n/nbb010ff6eede

## 課題6
1. LIMIT句を使うときに、OFFSETの値が大きくなるにつれて遅くなるのはなぜでしょうか？

2. mysqldumpslow コマンドの「-a」オプションはどんなオプションでしょうか？

3. 下記のクエリにインデックスが効かないのはなぜでしょうか？
```sql
CREATE INDEX birth_date_index ON employees(birth_date);

EXPLAIN SELECT * FROM employees WHERE YEAR(birth_date) = 1953;
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra       |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
|  1 | SIMPLE      | employees | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 292247 |   100.00 | Using where |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

1. LIMITのoffsetは、条件に合致する値を取得してから開始位置までの値を捨てる処理なので、offsetが大きくなると検索するデータ量が増えるためパフォーマンスが悪化する。
2. mysqldumpslowでは条件式の数字や文字列が抽象化して表示されますが、-aオプションを使うと実際の数値や文字列が表示されます。
3. 検索カラムに関数を使用しているため
