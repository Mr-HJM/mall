{{each}}
    <li data-id="{{$value.id}}">
        <div class="list-title">• {{$value.name}}</div>
        <ul class="list-hot clearfix">
            {{each $value.child}}
            <li data-id="{{$value.id}}">{{$value.name}}</li>
            {{/each}}
        </ul>
        <div class="classif-detail">
			<ul class="more-list clearfix">
				{{each $value.child}}
	            <li data-id="{{$value.id}}">{{$value.name}}</li>
	            {{/each}}
			</ul>
		</div>
    </li>
{{/each}}