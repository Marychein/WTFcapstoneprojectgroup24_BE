 SunFi Mobile Integration Guide 

 1. Core Functions Overview

These are the only functions you need to call to power the entire app.

A. Calculation Engine

Use this to get all the numbers for your charts and result screens.

```javascript
import { calculateSolarSizing } from './utils/solarLogic';

const results = calculateSolarSizing(225000); // Input: Monthly bill in Naira

```

What you get back (`results`):

 `results.consumption.dailyKWh`: User's daily power need.
 `results.systemSize.actualCapacityKW`: Recommended kW size (e.g., 3.2kW).
 `results.components.panels.quantity`: Number of 400W panels needed.
 `results.components.batteries.quantity`: Number of 200Ah batteries.
 `results.financials.totalSavings10Years`: The "Big Win" number for the user.

---
B. Vendor Matching

Use this to populate the "Available Installers" list.

```javascript
import { getMatchingVendors } from './utils/solarLogic';

const vendors = getMatchingVendors(3.2, "Lagos"); 

```

Important: Your location string must match the `headquarters` or `service_areas` in `vendors_enhanced.json`.

C. User Input Validation

Call this before navigating away from the input screen to prevent `NaN` errors.

```javascript
import { validateInput } from './utils/solarLogic';

const status = validateInput(monthlyBill);
if (!status.isValid) {
   alert(status.message); // Shows "Bill too low" or "Industrial audit required"
}

```
D. Data Analytics (Admin Screen)

If you built an Admin Dashboard for the project, use this:

```javascript
import { getSystemAnalytics } from './utils/solarLogic';

const stats = getSystemAnalytics();
// stats.data.totalValue -> Total Naira value of all quotes generated
// stats.data.popularLocation -> The city with most interest

```
Critical Integration Notes

1. JSON Data Links: Ensure `vendors_enhanced.json` and `quote_requests.json` are in the same folder as `solarLogic.js`. My code uses `path.join(__dirname, ...)` to find them automatically.

2. Naira Formatting: I have provided a `formatNaira(number)` utility inside the file. Use it to display prices like ₦1,250,000 consistently across the app.

3. Unique IDs: When saving quotes via `saveQuoteRequest()`, the backend automatically generates a unique `QR-XXXX` ID. You just need to pass the `userData` object (Name, Email, Phone, Location).



