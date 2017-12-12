{{each}}
<div class="easebuy-m clearfix" data-id="{{$value.id}}">
	<div class="smt">
        <div class="extra">
			<a class="del-btn">删除</a>
        </div>
	</div>
	<div class="smc">
		<div class="new-items clearfix">
			<div class="item-lcol">
            	<div class="item clearfix">
					<span class="label">收货人：</span>
					<div class="fl receiverVal">{{$value.receiver}}</div>
				</div>
                <div class="item clearfix hide">
					<span class="label">所在地区：</span>
					<div class="fl">{{$value.area}}</div>
				</div>
                <div class="item clearfix">
					<span class="label">地址：</span>
					<div class="fl contentVal">{{$value.content}}</div>
				</div>
				<div class="item clearfix">
					<span class="label">手机：</span>
					<div class="fl phoneVal">{{$value.phone}}</div>
				</div>
                <div class="item clearfix">
					<span class="label">固定电话：</span>
					<div class="fl telephoneVal">{{$value.telephone || ''}}</div>
				</div>
                <div class="item clearfix">
					<span class="label">电子邮箱：</span>
					<div class="fl emailVal">{{$value.email}}</div>
				</div>
			</div>
			<div class="item-rcol">
				<div class="extra">
					{{if $value.isDefault == '1'}}
					<a class="ml10 ftx-05 defalutAdd">默认地址</a>
					{{else}}
					<a class="ml10 ftx-05 setDefault">设为默认</a>
					{{/if}}
					<a class="ml10 ftx-05 update">编辑</a>
				</div>
			</div>
		</div>
	</div>
</div>
{{/each}}