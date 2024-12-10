
# Calendar Package Model
The calendar package is a model that implements classes making aggregation in statistical analysis easy.



The Calendar "main class" is a Singleton. Use **Calendar.SO** as a short way to access the singleton object.
For example in OCL: **Calendar.SO.Today** will return a Day object for today.  

Use the methods in Calendar to quickly find the Day for a given date when you link new or existing data to the structure.  
There are also several helper functions to find the next/previous day, week, or month or calculate the time between them.
For example in OCL: **Day.GetDayForDate()** returns a Day object by building a dictionary first for quick lookups.    
Integers called Ordinals are used to have a stable way to calculate how far apart objects are in time.


## Usage
1. Merge the Calendar package into your model using TKLiveView.
2. For all the Classes you want to capture the Date and Time details of records that can be used for detail statistical analysis, link the classes to the Day Class in the Calendar package. The Day Class is the linking point between your model and the Calendar package.
3. Goto to DateStructureBrowser ViewModel
4. Create a Year under Year Number
5. Then Select Year and execute Ensure Months and Days action
6. After execute Fix up Calendar action <br><br>


[Check Here](https://wiki.mdriven.net/Calendar_package) for more details on the Calendar package.