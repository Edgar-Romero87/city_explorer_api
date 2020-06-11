DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude DECIMAL(12,8),
  longitude DECIMAL(12,8)
);

INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ('test','testusa',20.2, 12.4 );
SELECT * FROM locations;

-- TEST TABLE IN TERMINAL: $ psql -d city_explorer -f schema.sql