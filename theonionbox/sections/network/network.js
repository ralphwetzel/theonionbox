<%
    oo_details = get('oo_details') if oo_details is None else oo_details

    oo_map = False
    if oo_details.is_relay():
        oo_map = oo_details('latitude') is not None and oo_details('longitude') is not None
    end

    oo_show = get('oo_show')
%>

% if oo_show is True:

    $(document).ready(function() {
        addNavBarButton('Network Status', 'network')

        % if oo_map:
            var map_div = new equalHeight($('#location_map'), $('#location_data'));
            init_map();
        % end

    })

    % if oo_map:

        function equalHeight(element, reference) {

            this.element = element;
            this.reference = reference;

            var adjustHeight = function(){
                this.element.height(this.reference.height());
            }.bind(this)

            //Run function when browser resizes
            $(window).resize(adjustHeight);

            //Initial call
            adjustHeight();
        }

        function init_map() {

            // This is very basic ... but it works ;)!

            var vectorSource = new ol.source.Vector({
              //create empty vector
            });

            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([{{oo_details('longitude')}}, {{oo_details('latitude')}}])),
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
                layers: [new ol.layer.Tile({source: new ol.source.OSM()}), vectorLayer],
                view: new ol.View({
                    center: ol.proj.fromLonLat([{{oo_details('longitude')}}, {{oo_details('latitude')}}]),
                    zoom: 12
                })
            });
        }
    % end

% #// 'end' for 'if oo_show is True:'
% end