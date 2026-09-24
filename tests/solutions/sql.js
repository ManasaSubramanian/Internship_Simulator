// Reference queries for internship 6 (SQL). Used by the tests and by
// tests/gen-sql-expected.js to precompute the expected result sets.
module.exports = {
  s1: "SELECT first_name, last_name\nFROM guests\nWHERE state = 'FL'\nORDER BY last_name, first_name;",
  s2: "SELECT a.name, COUNT(*) AS reservations\nFROM reservations r\nJOIN attractions a ON a.attraction_id = r.attraction_id\nWHERE r.status = 'confirmed'\nGROUP BY a.name\nORDER BY reservations DESC, a.name;",
  s3: "SELECT g.first_name, a.name\nFROM reservations r\nJOIN guests g ON g.guest_id = r.guest_id\nJOIN attractions a ON a.attraction_id = r.attraction_id\nWHERE r.res_date = '2027-06-14'\nORDER BY g.first_name, a.name;",
  s4: "SELECT a.land, SUM(r.party_size) AS guests\nFROM reservations r\nJOIN attractions a ON a.attraction_id = r.attraction_id\nWHERE r.status = 'confirmed'\nGROUP BY a.land\nORDER BY guests DESC, a.land;",
  s5: "SELECT a.name, ROUND(AVG(rt.stars), 2) AS avg_stars\nFROM ratings rt\nJOIN attractions a ON a.attraction_id = rt.attraction_id\nGROUP BY a.name\nHAVING AVG(rt.stars) >= 4\nORDER BY avg_stars DESC, a.name;",
  s6: "SELECT g.guest_id, g.first_name, g.last_name\nFROM guests g\nLEFT JOIN reservations r ON r.guest_id = g.guest_id\nWHERE r.res_id IS NULL\nORDER BY g.guest_id;",
  s7: "SELECT type, ROUND(SUM(price), 2) AS revenue\nFROM tickets\nWHERE price > 0\nGROUP BY type\nORDER BY revenue DESC;",
  s8: "SELECT g.first_name, g.last_name, ROUND(SUM(t.price), 2) AS spend,\n  RANK() OVER (ORDER BY SUM(t.price) DESC) AS rnk\nFROM tickets t\nJOIN guests g ON g.guest_id = t.guest_id\nWHERE t.price > 0\nGROUP BY g.guest_id\nORDER BY rnk, g.guest_id\nLIMIT 5;",
  s9: "SELECT guest_id, type, purchased, COUNT(*) AS n\nFROM tickets\nGROUP BY guest_id, type, purchased\nHAVING COUNT(*) > 1\nORDER BY guest_id, type;",
  s10: "SELECT purchased, ROUND(SUM(price), 2) AS revenue, COUNT(*) AS tickets\nFROM tickets\nWHERE price > 0\nGROUP BY purchased\nORDER BY purchased;",
  s11: "SELECT ticket_id, guest_id, type\nFROM tickets\nWHERE price IS NULL OR price < 0\nORDER BY ticket_id;",
  s12: "SELECT CASE WHEN g.member = 1 THEN 'member' ELSE 'guest' END AS segment,\n  ROUND(AVG(t.price), 2) AS avg_price\nFROM tickets t\nJOIN guests g ON g.guest_id = t.guest_id\nWHERE t.price > 0\nGROUP BY segment\nORDER BY segment;",
  'i-sql1': "SELECT state, COUNT(*) AS guests\nFROM guests\nGROUP BY state\nORDER BY guests DESC, state;",
  'i-sql2': "SELECT name\nFROM attractions\nWHERE land = 'Frontier'\nORDER BY name;",
  'i-sql3': "SELECT ticket_id, price\nFROM tickets\nORDER BY price DESC, ticket_id\nLIMIT 3;",
};
