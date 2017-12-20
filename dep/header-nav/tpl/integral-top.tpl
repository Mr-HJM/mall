<div class="top-site">
    <div class="site">
        <!-- 未登录 -->
        <div class="welcome-presence fl">
            <div class="welcome fl">您好，欢迎光临御廷家居！</div>
            <div class="site-loged fl">
                <span class="loging">[ 登录 ]</span>
                <span class="register">[ 注册 ]</span>
            </div>
        </div>
        <!-- 已登录 -->
        <div class="site-loging-success fr">
            <ul class="clearfix">
                <li class="my-order"><i class="order"></i><a>我的订单</a></li>
                <li class="my-car"><i class="cart"></i><a>购物车</a></li>
                <li class="mu-info"><i class="user"></i><a>用户管理</a></li>
            </ul>
        </div>
    </div>
</div>
<div class="topCon">
    <div class="top-logo clearfix">
        <div class="logo fl">
            <img src="../../bundle/img/logo.png">
        </div>
        <div class="search fl">
            <input type="text" class="search-name fl">
            <span class="search-btn fr">搜  索</span>
            <img src="../../bundle/img/icon-search.png" class="search-icon">
            <img src="../../bundle/img/icon-yuyin.png" class="yuyin-icon">
            <ul class="search-hot"></ul>
        </div>
    </div>
    <div class="all-nav clearfix">
        <div class="all-classify fl">全部商品分类</div>
        <ul class="nav-classify fl">
            {{each}}
                <li data-num="{{$value.number}}" data-id="{{$value.id}}">{{$value.name}}</li>
            {{/each}}
        </ul>
    </div>
    <div class="all-list">
        <ul class="all_list"></ul>
        <div class="more-categories">
            <span>更多分类</span>
            <!-- 更多分类 -->
            <div class="more-fen clearfix"></div>
        </div>
    </div>
</div>