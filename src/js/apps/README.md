# Apps

The is the business logic and contains the app tree of toolkit app children. Apps are generally responsible for creating a layout within its region,
requesting data and organizing and passing the data to views shown in the layout or child apps passed a region from the layout.
If an app has children, the children are nested in their own directories. Files should follow the `app-name/app-name_app.js` convention.
There will be exceptions where related apps are grouped together under within a single directory (ie: `globals/*`).
The directory structure should be based on how the app is visibly organized from the design and roughly mirror `/views`.
