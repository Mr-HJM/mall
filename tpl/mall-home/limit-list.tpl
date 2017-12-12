{{each}}
{{if $index == '0'}}
<ul class="xianshi clearfix" style="display: block;">
    <input type="hidden" value="{{$value.startTime}}" class="start-time">
    <input type="hidden" value="{{$value.endTime}}" class="end-time">
    {{each $value.items}}
    <li class="fl" data-id="{{$value.id}}">
        <div class="goods-img">
        	<img src="{{$value.onePhoto}}">
        	<div class="limit-time clearfix">
        		<img class="fl" src="../../bundle/img/icon-limit-time.png">
        		<div class="time-detail fl"></div>
        	</div>
        </div>
        <p class="goods-name">{{$value.name}}</p>
        <p class="goods-money">￥<b>{{$value.price}}.00</b> <!-- <i></i> --></p>
    </li>
    {{/each}}
</ul>
{{else}}
<ul class="xinpin clearfix">
    <input type="hidden" value="{{$value.startTime}}" class="start-time">
    <input type="hidden" value="{{$value.endTime}}" class="end-time">
    {{each $value.items}}
    <li class="fl" data-id="{{$value.id}}">
        <div class="goods-img">
            <img src="{{$value.onePhoto}}">
        </div>
        <p class="goods-name">{{$value.name}}</p>
        <p class="goods-money">￥<b>{{$value.price}}.00</b> <!-- <i></i> --></p>
    </li>
    {{/each}}
</ul>
{{/if}}
{{/each}}