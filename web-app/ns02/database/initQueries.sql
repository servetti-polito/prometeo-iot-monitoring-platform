CREATE DATABASE IF NOT EXISTS prometeo_db;

USE prometeo_db;

CREATE TABLE IF NOT EXISTS SURVEYS (
  resultID VARCHAR(255) NOT NULL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  boardID INT NOT NULL,
  userID VARCHAR(255) NOT NULL,
  answers TEXT
);

CREATE TABLE IF NOT EXISTS PERSONAL (
  userID VARCHAR(255) NOT NULL PRIMARY KEY,
  answers TEXT
);
