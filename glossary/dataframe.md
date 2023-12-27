---
title: DataFrame
description: A DataFrame is a two-dimensional table of rows and columns, similar to a spreadsheet, that organizes data in a structured way. It is one of the most commonly used data structures in modern data analytics due to its flexibility and ease of use.
---

# DataFrames

## What is a DataFrame?

A **DataFrame** is a two-dimensional table of rows and columns, similar to a spreadsheet, that organizes data in a structured way. It is one of the most commonly used data structures in modern data analytics due to its flexibility and ease of use.

Each DataFrame has a schema that defines the name and data type of each column. Spark DataFrames can contain universal data types like StringType and IntegerType, as well as data types that are specific to Spark, such as StructType. Missing or incomplete values are stored as null values in the DataFrame.

DataFrames are like spreadsheets with named columns, but they can span thousands of computers, making it possible to analyze big data using distributed computing clusters. This is because the data may be too large to fit on one machine or the computation may take too long on a single machine.

DataFrames are a common concept across many different languages and frameworks. They are the main data type used in pandas, a popular Python data analysis library, and are also used in R, Scala, and other languages.
