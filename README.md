# Simple Express App For Attaching Notes to GeoLocations

<p style="color:grey;">pet project under construction...</p>

- Create isolated environments (**projects**) that can be shared with other people;
- Define colorcoded **collections** (e.g., 'bird watching spots' or 'coffee places');
- Add collection-bound **location markers** to the map with some notes attached.



## Description
This is a simple Express App for creating notes attached to geolocations. Under the hood it uses MongoDB to store user-supplied information and MapBoxGL to render maps with interactive location markers.

This app is mostly meant for creating wordy, highly detailed and hierarchical descriptions associated with geolocations, as opposed to brief notes that appear directly on the map. You can still choose some brief note to appear on the map if you mouseover the location marker. The main text body would be displayed next to the map if you click the location marker.

## Installation
Instead of installing it you can first check the demo at https://whispering-bastion-22172.herokuapp.com. However, keep in mind that the demo has limited DB capacity (512 MB) and a limited number of map reloads.

If you do want to install it locally and tinker with the code follow the instructions below:

### Local Install
#### Node and dependencies
You need to have [node.js](https://nodejs.org/en/) version 15.0.0 or higher.

If you have the correct version of node, clone this repo as:
```bash
$ git clone https://github.com/axyorah/geonotes.git
```

Go to the root of the cloned repo and install all the dependencies by running:
```bash
$ npm install 
```
#### MongoDB: database and service
To install MongoDB on your local machine, go to https://docs.mongodb.com/manual/installation/ and follow the instructions to install free MongoDB Community Edtition for your OS.

If you're on Linux, you'll need to manually start mongoDB service **each time you want to use the database**. To do it open your terminal and type:
```bash
$ sudo systemctl start mongod
```

To see the contents of your local database from `mongo` shell, in your terminal type:
```bash
$ mongo
```
... and select `rov` database:
```
> use rov
```

For mongoDB queries check, e.g., https://docs.mongodb.com/manual/reference/ or https://www.tutorialspoint.com/mongodb/index.htm

#### MapBox and Environmental variables
Finally, to enable the map functionality we'll need to get MapBoxGL token and save it as environmental variable. To get the token go to https://www.mapbox.com/ and make free account. On your account page look for **Default public token**. 

To set this token as environmental variable go to the project root and create `.env` file with content:
```
MAPBOX_TOKEN=<mapboxgl token>
``` 

Replace `<mapboxgl token>` with your **Default public token**.

That's it! You can access the app by going to `localhost:3000` in your browser.

## Use
Start with creating a user account. Its only purpose is to manage access to isolated environments (projects). After creating an account new default project "My First Project" will be automatically created for you. You can start by editing this project to adjust its name, description and map settings (center, zoom and style).

Once it is done, you can start populating the project with data. Start by creating a New Collection. It will not be visible on the map at first, but once you add a location to it, a marker will appear on the map at corresponding location with a color that you chose for the Collection.

On project home page you can view all the collections that belong to this project. If you follow the collection-link you can see all the locations associated with this collection.

You can also access the location-data from the map: hover over the location markers to see a short note or click on the marker to see the detailed information.

You can always edit or delete any location or collection information by clicking location/collection edit or delete buttons. Finally, you can create a New Project and share it with other people by via Project Token, which is always visitble on the project home page.