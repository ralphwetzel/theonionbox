<%
    oo_details = get('oo_details') if oo_details is None else oo_details

    tor = get('tor') if tor is None else tor
    geoip = get('geoip') if geoip is None else geoip

    # this could be done as well by
    # ip = tor.get_address()
    # yet this section shall display onionoo data (only)
    ip = None   

    if len(oo_details('or_addresses')) > 0:
        ip = oo_details('or_addresses')[0]
    end

    geoip_lat = geoip.latitude(ip, oo_details('latitude'))
    geoip_long = geoip.longitude(ip, oo_details('longitude'))
        
    oo_map = geoip_lat is not None and geoip_long is not None

    # oo_show = get('oo_show')
%>



$(document).ready(function() {
    addNavBarButton('Network Status', 'network');

    % if oo_map:
        var map_div = new equalHeight($('#location_map'), $('#location_data'));
        init_map();
    % end

});

% if oo_map:

    function equalHeight(element, reference) {

        this.element = element;
        this.reference = reference;

        var adjustHeight = function(){
            this.element.height(this.reference.height());
        }.bind(this);

        //Run function when browser resizes
        $(window).resize(adjustHeight);

        //Initial call
        adjustHeight();
    }

    function init_map() {

        // http://dev.camptocamp.com/files/fredj/cluster_master/examples/wmts-hidpi.js

        // HiDPI support:
        // * Use 'bmaphidpi' layer (pixel ratio 2) for device pixel ratio > 1
        // * Use 'geolandbasemap' layer (pixel ratio 1) for device pixel ratio == 1
        //var hiDPI = ol.BrowserFeature.DEVICE_PIXEL_RATIO > 1;
        var hiDPI = true;

        // This is very basic ... but it works ;)!

        var vectorSource = new ol.source.Vector({
          //create empty vector
        });

        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([{{geoip_long}}, {{geoip_lat}}])),
        });
        vectorSource.addFeature(iconFeature);

        //create the style
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 0.85,
                src: 'data:image/gif;base64,{{marker}}'
            }))
        });

        //add the feature vector to the layer vector, and apply a style to whole layer
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: iconStyle
        });

        var map = new ol.Map({
            target: 'location_map',
            // pixelRatio: 2,
            layers: [new ol.layer.Tile({source: new ol.source.OSM(/*{tilePixelRatio: 2}*/)}), vectorLayer],
            // layers: [new ol.layer.Tile({source: new ol.source.WMTS({ layer: hiDPI ? 'bmaphidpi' : 'geolandbasemap',
            //                                                         tilePixelRatio: hiDPI ? 2 : 1})})
            //        , vectorLayer],
            view: new ol.View({
                center: ol.proj.fromLonLat([{{geoip_long}}, {{geoip_lat}}]),
                zoom: 12
            })
        });

        // map.getViewport().getElementsByTagName('canvas')[0].getContext("2d").scale(2,2);
    }

% end
