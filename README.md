# Web Development Project 5 & 6 - Weather & Location Dashboard

Submitted by:  Roel Crodua

This web app: 

This project is a Weather and Location Dashboard that shows key weather details using data from a public API. It gives users an easy view of current conditions, allows searching by location, and displays results that can be filtered. The app uses React features like useEffect, map(), and filter() to fetch and show live data, respond to user input, and make weather information simple and engaging to explore.

In this next part, data visualizations and detailed views are added, allowing users to click on a location to see more information. The app uses React Router for navigation, dynamic links, and parameters, making the weather data more interactive and informative.

Time spent: 25 hours spent in total

## PART 1
### Required Features

The following **required** functionality is completed:

- [x] **The site has a dashboard displaying a list of data fetched using an API call**
  - The dashboard should display at least 10 unique items, one per row
  - The dashboard includes at least two features in each row
- [x] **`useEffect` React hook and `async`/`await` are used**
- [x] **The app dashboard includes at least three summary statistics about the data** 
  - The app dashboard includes at least three summary statistics about the data, such as:
    - *insert details here*
- [x] **A search bar allows the user to search for an item in the fetched data**
  - The search bar **correctly** filters items in the list, only displaying items matching the search query
  - The list of results dynamically updates as the user types into the search bar
- [x] **An additional filter allows the user to restrict displayed items by specified categories**
  - The filter restricts items in the list using a **different attribute** than the search bar 
  - The filter **correctly** filters items in the list, only displaying items matching the filter attribute in the dashboard
  - The dashboard list dynamically updates as the user adjusts the filter

### Optional Features
The following **optional** features are implemented:

- [x] Multiple filters can be applied simultaneously
- [x] Filters use different input types
  - e.g., as a text input, a dropdown or radio selection, and/or a slider
- [x] The user can enter specific bounds for filter values

### Additional Features
The following **additional** features are implemented:

* [x] Make the page responsive.


## PART 2
### Required Features

The following **required** functionality is completed:

- [x] **Clicking on an item in the list view displays more details about it**
  - Clicking on an item in the dashboard list navigates to a detail view for that item
  - Detail view includes extra information about the item not included in the dashboard view
  - The same sidebar is displayed in detail view as in dashboard view
  - *To ensure an accurate grade, your sidebar **must** be viewable when showing the details view in your recording.*
- [x] **Each detail view of an item has a direct, unique URL link to that item’s detail view page**
  -  *To ensure an accurate grade, the URL/address bar of your web browser **must** be viewable in your recording.*
- [x] **The app includes at least two unique charts developed using the fetched data that tell an interesting story**
  - At least two charts should be incorporated into the dashboard view of the site
  - Each chart should describe a different aspect of the dataset

### Optional Features
The following **optional** features are implemented:

- [x] The site’s customized dashboard contains more content that explains what is interesting about the data 
  - e.g., an additional description, graph annotation, suggestion for which filters to use, or an additional page that explains more about the data
- [x] The site allows users to toggle between different data visualizations
  - User should be able to use some mechanism to toggle between displaying and hiding visualizations 

### Additional Features
The following **additional** features are implemented:

* [x] Deploy through github pages: https://roeldcrodua.github.io/WeatherLocationDashboard_ReactJS/

## Video Walkthrough

Here's a walkthrough of implemented user stories:

### PART 1
<img src='https://github.com/roeldcrodua/WeatherLocationDashboard_ReactJS/blob/main/src/assets/demo.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

### PART 2
<img src='https://github.com/roeldcrodua/WeatherLocationDashboard_ReactJS/blob/main/src/assets/demo2.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />
<!-- Replace this with whatever GIF tool you used! -->
GIF created with Wondershare Uniconverter 14 Tool - GIF Maker 
<!-- Recommended tools:
[Kap](https://getkap.co/) for macOS
[ScreenToGif](https://www.screentogif.com/) for Windows
[peek](https://github.com/phw/peek) for Linux. -->

## Notes

Describe any challenges encountered while building the app.
- Hard to find a good and reliable api site that provides a good amount of request.

## License

    Copyright 2025 Roel Crodua

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.