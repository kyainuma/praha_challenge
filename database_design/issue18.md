# 複合インデックスを理解する
## 課題1

複合インデックスは、複数の列にまたがるひとつの インデックスのことです。2列からなるインデックスの順序付けは、最初に姓で並べ替え、さらに名前で並べ替えるという点で、電話帳の順序付けと似ています。 名前だけで電話帳を引くことはできないように、2列のインデックスは、2番目の列だけでの検索はできません。

> どういうことでしょうか？
>

複合インデックスの場合、最初の項目の列に指定した列がクエリで使われていない場合にはインデックスは使われない動作になります。名前、姓の順番で複合インデックスを貼っているため、姓の検索時にインデックスが使用されずフルテーブルスキャンしてしまう。

> 複合インデックスを使う場合、どう作り直せば良いのでしょうか？
>

最初の項目ほど足きりが多くできる列を指定します。また、検索に最もよく利用される列を指定します。

## 課題2

> 2つ以上のwhere句を組み合わせたSELECTクエリを3つ考えてください
>

```sql
SELECT * FROM employees WHERE last_name='Tsukuda' AND first_name='Sachin';
2 rows in set (0.11 sec)

SELECT * FROM employees WHERE birth_date = '1958-05-01' AND hire_date = '1997-11-30';
1 rows in set (0.11 sec)

SELECT * FROM salaries WHERE salary > 150000 AND DATE_FORMAT(from_date, '%Y') > 2000;
22 rows in set (0.43 sec)
```

> 上記のSELECTクエリを高速化する複合インデックスを作成してください
>

```sql
CREATE INDEX last_name_first_name_index ON employees(last_name, first_name);

CREATE INDEX birth_date_hire_date_index ON employees(birth_date, hire_date);

CREATE INDEX salary_from_date_index ON salaries(salary, from_date);
```

> 複合インデックスを使って検索した場合、どれだけ検索速度に差が出るか、測定してください
>

```sql
SELECT * FROM employees WHERE last_name='Tsukuda' AND first_name='Sachin';
2 rows in set (0.00 sec)

SELECT * FROM employees WHERE birth_date = '1958-05-01' AND hire_date = '1997-11-30';
1 row in set (0.01 sec)

SELECT * FROM salaries WHERE salary > 150000 AND DATE_FORMAT(from_date, '%Y') > 2000;
22 rows in set (0.00 sec)
```

> EXPLAINを使って、ちゃんと複合インデックスが使われていることを証明してください
>

```sql
EXPLAIN SELECT * FROM employees WHERE last_name='Tsukuda' AND first_name='Sachin';
+----+-------------+-----------+------------+------+----------------------------+----------------------------+---------+-------------+------+----------+-------+
| id | select_type | table     | partitions | type | possible_keys              | key                        | key_len | ref         | rows | filtered | Extra |
+----+-------------+-----------+------------+------+----------------------------+----------------------------+---------+-------------+------+----------+-------+
|  1 | SIMPLE      | employees | NULL       | ref  | last_name_first_name_index | last_name_first_name_index | 94      | const,const |    2 |   100.00 | NULL  |
+----+-------------+-----------+------------+------+----------------------------+----------------------------+---------+-------------+------+----------+-------+
1 row in set, 1 warning (0.00 sec)

EXPLAIN SELECT * FROM employees WHERE birth_date = '1958-05-01' AND hire_date = '1997-11-30';
+----+-------------+-----------+------------+------+----------------------------+----------------------------+---------+-------------+------+----------+-------+
| id | select_type | table     | partitions | type | possible_keys              | key                        | key_len | ref         | rows | filtered | Extra |
+----+-------------+-----------+------------+------+----------------------------+----------------------------+---------+-------------+------+----------+-------+
|  1 | SIMPLE      | employees | NULL       | ref  | birth_date_hire_date_index | birth_date_hire_date_index | 6       | const,const |    1 |   100.00 | NULL  |
+----+-------------+-----------+------------+------+----------------------------+----------------------------+---------+-------------+------+----------+-------+
1 row in set, 1 warning (0.00 sec)

EXPLAIN SELECT * FROM salaries WHERE salary > 150000 AND DATE_FORMAT(from_date, '%Y') > 2000;
+----+-------------+----------+-----------------------------------------------------------------------------+-------+------------------------+------------------------+---------+------+------+----------+-----------------------+
| id | select_type | table    | partitions                                                                  | type  | possible_keys          | key                    | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+----------+-----------------------------------------------------------------------------+-------+------------------------+------------------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | salaries | p01,p02,p03,p04,p05,p06,p07,p08,p09,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19 | range | salary_from_date_index | salary_from_date_index | 4       | NULL |   36 |   100.00 | Using index condition |
+----+-------------+----------+-----------------------------------------------------------------------------+-------+------------------------+------------------------+---------+------+------+----------+-----------------------+
1 row in set, 1 warning (0.00 sec)
```

> 「Employees」テーブルから有意義な情報を取得、あるいは集計するクイズを3つ作成してください。**（回答のSELECT文には、WHERE句が2つ以上含まるようにしてください）**
>
- last_nameがAamodtでfirst_nameがMで始まる従業員を抽出して下さい
- birth_dateが1952-02-01でlast_nameがRで始まる従業員を集計して下さい
- hire_dateが1985-01-01でbirth_dateが1962-02-24の従業員を抽出して下さい
