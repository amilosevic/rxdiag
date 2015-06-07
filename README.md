# rxdiag - Animirani Rx "Marble" Dijagrami


## Ciljevi
 1. Okvir za vizalizacija rada Rx kombinatora/operatora. 
 2. Lako uključivanje animacije u HTML dokumente koristeći nekoliko linija JavaScript koda.
 3. Definisanje ulaznih tokova animacije koristeći nizove i objekte.
 4. Definisanje ulaznih tokova iz brauzer DOM evenata (mouseover, keyup, mouseover ...)
 5. Definisanje lanca kombinatora koristeći Rx Js biblioteku.
 6. (samo JS verzija) Generisanje SVG statičkih prikaza pojedinih faza animacije 

## ToDo
 - (loop) kružno izvršavanje animacije
 - (pause/stop) kontrola animacije
 - ~~(create operators) prikaz operatora bez ulaznog toka (Just, Throw, Empty...)~~
 - ~~(multiple inputs) prikaz operatora sa više ulaza (Map, Merge ...)~~
 - (dom event streams) brauzer DOM event tokovi 
 - (graphics) strelice, senke...

## Primer

Primer rada kombinatora [**Delay**](http://reactivex.io/documentation/operators/delay.html) sa parametrom 500ms. Ulazni tok se okončava izuzetkom. http://rx.eu01.aws.af.cm/delay500.html 

## Linkovi
 - http://www.w3schools.com/svg/
 - https://developer.mozilla.org/en-US/docs/Web/SVG
 - http://www.december.com/html/spec/colorsvg.html

 - http://d3js.org/
 - https://github.com/mbostock/d3/wiki
 - https://www.dashingd3js.com/
 - http://www.d3noob.org/2014/02/d3js-elements.html
 - https://github.com/wbzyl/d3-notes
 - http://bl.ocks.org/

 - https://github.com/Reactive-Extensions/RxJS
 - https://xgrommx.github.io/rx-book/
 - https://github.com/staltz/rxmarbles
 
 - http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
 - http://www.w3schools.com/js/
 
