function legendPlugin(options){
    return function legendPlugin(chart){
        var colors = ['red', 'blue', 'green', 'purple', 'yellow', 'black', 'pink', 'cyan'];

        var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

        chart.on('created', function(data){
            if(chart.data.series.length > 0){
                for(var x = 0; x < chart.data.series.length; x++ ){
                    var xPos = data.options.axisY.offset + data.options.chartPadding.left;
                    var yPos = data.options.chartPadding.top; 
                    if (data.options.axisY.position === 'end') {
                        xPos -= data.options.axisY.offset;
                    }

                    if (data.options.axisX.position === 'end') {
                        yPos += data.axisY.axisLength;
                    }
                    var add = (data.axisX.axisLength / 2);
                    var text = new Chartist.Svg("text");
                    var circle = new Chartist.Svg("circle");
                    text.text(chart.data.series[x][0].name) ;
                    var xp, yp;
                    if(Math.abs(x) % 2 == 1){
                        xp = xPos+add ;
                        yp = yPos+30 +(15*((x-1)/2));
                        text.attr({
                            x: xp,
                            y: yp,
                            "text-anchor": 'start'
                        });
                        circle.attr({
                            "cx": xp -10,
                            "cy": yp-6,
                            "r":"6",
                            "stroke":colors[x],
                            "fill" : colors[x]
                        });
                    }else{
                        xp = xPos;
                        yp = yPos+30 +(15*(x/2));
                        text.attr({
                            x: xp,
                            y: yp,
                            "text-anchor": 'start'
                        });
                        circle.attr({
                            "cx": xp -10,
                            "cy": yp -6,
                            "r":"6",
                            "stroke":colors[x],
                            "fill" : colors[x]
                        });
                    }
                    data.svg.append(text, false) ;
                    data.svg.append(circle, false) ;
                }
            }

        });
    };

}
