
# this library is used for data manipulation (like excel but in python)
import pandas as pd

# used for numerical operations
import numpy as np

# train_test_split, it splits the data into training and testing test
from sklearn.model_selection import train_test_split

# randomforestregressor, machine learning model for regression
from sklearn.ensemble import RandomForestRegressor

# for evaluation metrics
from sklearn.metrics import mean_absolute_error, r2_score

# converts text categories into numbers
from sklearn.preprocessing import LabelEncoder

#lOADING OF DATASET
df = pd.read_csv("c:/Users/DELL/Desktop/CAPSTONE/sme_solar_synthetic_data_naira.csv")
print(df.head())

#CLEAN COLUMN NAMES
#remove extra spaces
#convert all column names to lower cases
df.columns = df. columns.str.lower().str.strip()

# select the features and target variables

#our target variables ( what we want to predict)
#system size in kw is our target variable
target = "recommended_system_size_kw"

# features (what inputs influence the system size)
features = [ 
    "monthly_kwh",
    "operating_hours_per_day",
    "roof_size_sqm",
    "business_type",
    "location"
]

# keep only selected columns
print(df.columns)
df = df[features +  [target]].dropna()

# ENCODING THE CATEGORICAL VARIABLES

# machine learning models cannot understand text.
# so we convert categories into numbers.

# now we create the labelencoder object for business_type
le_business = LabelEncoder()

# create labelencoder object for location_state
le_location = LabelEncoder()

# now we fit and transform:
# .fit() learns unique categories
# .transform converting categories to numbers
df["business_type"] = le_business.fit_transform(df["business_type"])
df["location"] = le_location.fit_transform(df["location"])

# define the variables x and y
 # x is our independent variable
x = df[features]

# y is our dependent variable
y = df[target]

# TRAINING AND TEST
#random _ state
x_train, x_test, y_train, y_test = train_test_split(
    x,
    y,
    test_size=0.2,
    random_state=42
)
# RANDOM FOREST MODEL

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=None,
    random_state=42
)
 # this model will use training data
model.fit(x_train, y_train)

y_pred = model.predict(x_test)


#mean error prediction
mae = mean_absolute_error(y_test, y_pred)

# measure the model variance 
r2 = r2_score(y_test, y_pred)

print("Model Performance:")
print("Mean Absolue Error:", round(mae, 3))
print("R2 score:", round(r2, 3))


# sample input
example = pd.DataFrame({
    "monthly_kwh": [1500],
    "operating_hours_per_day": [10],
    "roof_size_sqm": [120],
    "business_type": [le_business.transform(["Retail Store/Trading"])[0]],
    "location":[le_location.transform(["Kano"])[0]]
})
prediction = model.predict(example)

print("\nRecommended System size (KW):", round(prediction[0], 2))


# Generate Predictions

# Create feature matrix again (same features used during training)
X_full = df[features]

# Generate predictions for ALL rows
predictions = model.predict(X_full)

# Add predictions as new column
df['predicted_system_size_kw'] = predictions

print("Predicted column added successfully!")
print(df[['predicted_system_size_kw']].head())

COST_PER_KW = 550000  # adjust if needed

df["installation_cost"] = (
    df["predicted_system_size_kw"] * COST_PER_KW
)

df["annual_energy_kwh"] = df["monthly_kwh"] * 12

SAVINGS_PER_KWH = 120  

df["annual_savings"] = (
    df["annual_energy_kwh"] * SAVINGS_PER_KWH
)

df["roi_years"] = (
    df["installation_cost"] /
    df["annual_savings"]
)

df["roi_years"] = df["roi_years"].round(2)

print(df[[
    "predicted_system_size_kw",
    "installation_cost",
    "annual_savings",
    "roi_years"
]].head())

df["size_difference"] = (
    df["predicted_system_size_kw"] -
    df["recommended_system_size_kw"]
)

print(df[[
    "recommended_system_size_kw",
    "predicted_system_size_kw",
    "size_difference"
]].head())


print(df.columns)