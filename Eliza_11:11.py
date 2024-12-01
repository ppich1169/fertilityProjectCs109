
#Drop DC because it's not a state: 
pol_2022_df = pol_2022_df[pol_2022_df['State'] != 'District of Columbia']
pol_2022_df.reset_index(drop=True, inplace=True)

# Convert 2020_Biden, 2020_Trump, 2016_Clinton, 2016_Trump to ints for future calculations
perc_to_int_columns = ['2020_Biden', '2020_Trump', '2016_Clinton', '2016_Trump']
pol_2022_df[perc_to_int_columns] = pol_2022_df[perc_to_int_columns].apply(
    lambda col: col.astype(str).str.rstrip('%').astype(float)
)

# Calculate the 2022 PVI using the old methodology:
national_2020 = 4.4 #D+4.4
national_2016 = 2.1 #D+2.1 
lean_2020 =  pol_2022_df["2020_Biden"] - pol_2022_df["2020_Trump"] #How democrat it leans (- democrat is republican)
lean_2016 =  pol_2022_df["2016_Clinton"] - pol_2022_df["2016_Trump"] #same as lean_2020

# Positive differences are d
diff_from_nat_2016 = lean_2016 - national_2016 # If positive leans dem, if negative leans republican
diff_from_nat_2020 = lean_2020 - national_2020 # Sams as ^

# Make a column for old methodology - unscaled rating (negative is Republican, positive is Dem)
# Dividing by two twice bc that's what it seems like Cook PVI methodology did
# Also rounding to the nearest int
pol_2022_df["2022_unscaled_rating_old"] = round(((diff_from_nat_2016 + diff_from_nat_2020) / 2) / 2)

# Now, scale the 2020_unscaled_rating_old
pol_rating_scaler = MinMaxScaler()
scaled_2022_ratings_old = pol_rating_scaler.fit_transform(pol_2022_df['2022_unscaled_rating_old'].values.reshape(-1,1))

pol_2022_df["2022_scaled_rating_old"] = scaled_2022_ratings_old
pol_2022_df[:20]

pol_2022_df["Year"] = 2022

years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
pol_by_year = []

for i in range(len(years)):
    year_df = f'pol_{years[i]}_df'
    year_df = pol_2022_df.copy()
    year_df["Year"] = years[i]
    pol_by_year.append(year_df)

print(len(pol_by_year))
print(type(pol_by_year[0]))

pol_by_year.append(pol_2022_df)

pol_combined = pd.concat(pol_by_year, ignore_index=True)
