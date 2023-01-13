You also need to load maps.

You do that by to this file: EXT_Scripts\AppWideAngularScriptIncludes.html
add this row:

<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=<YourAPIKey>&callback=initMap">
</script>

Place the component on "Positions" that has color,lat,lng,title