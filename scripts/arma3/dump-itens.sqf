private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    if (_s select [0, 1] == "$") then { _s = localize _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_sub = {
    private _s = _this call _fnc_lim;
    _s = _s regexReplace ["[;:]", " "];
    _s
};

private _fnc_n = {
    if (isNumber _this) then { (getNumber _this) toFixed 4 } else { "" };
};

private _fnc_pedacos = {
    params ["_marca", "_classe", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3ITEM>>%1|%2|%3", _marca, _classe, _p]);
        _texto = _texto select [700];
    };
};

private _fnc_heranca = {
    private _c = _this;
    private _saida = [];
    private _n = 0;
    while { _n < 14 } do {
        _c = inheritsFrom _c;
        if (isNull _c) exitWith {};
        private _nome = configName _c;
        if (_nome == "") exitWith {};
        _saida pushBack _nome;
        _n = _n + 1;
    };
    _saida joinString ";"
};

diag_log text "<<A3ITEM>>INICIO|v1";

private _itens = "
    (getNumber (_x >> 'scope') >= 2) &&
    {!((getNumber (_x >> 'type')) in [1, 2, 4])}
" configClasses (configFile >> "CfgWeapons");

private _nItens = 0;

{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _ii = _cfg >> "ItemInfo";

    private _desc = (getText (_cfg >> "descriptionShort")) call _fnc_lim;
    if (count _desc > 90) then { _desc = _desc select [0, 90] };

    diag_log text (format ["<<A3ITEM>>I|%1|%2|%3|%4|%5|%6",
        _classe,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        (_cfg >> "type") call _fnc_n,
        (configSourceMod _cfg) call _fnc_lim,
        (_ii >> "type") call _fnc_n,
        _desc
    ]);

    diag_log text (format ["<<A3ITEM>>IP|%1|%2|%3|%4|%5",
        _classe,
        (getText (_cfg >> "picture")) call _fnc_lim,
        (getText (_cfg >> "model")) call _fnc_lim,
        (_ii >> "mass") call _fnc_n,
        (_cfg >> "mass") call _fnc_n
    ]);

    ["IX", _classe, _cfg call _fnc_heranca] call _fnc_pedacos;

    private _cont = getText (_ii >> "containerClass");
    if (_cont != "") then {
        diag_log text (format ["<<A3ITEM>>IC|%1|%2|%3",
            _classe,
            _cont call _fnc_lim,
            (configFile >> "CfgVehicles" >> _cont >> "maximumLoad") call _fnc_n
        ]);
    };

    private _uni = getText (_ii >> "uniformClass");
    if (_uni != "") then {
        diag_log text (format ["<<A3ITEM>>IU|%1|%2", _classe, _uni call _fnc_lim]);
    };

    private _prot = [];
    {
        _prot pushBack format ["%1:%2:%3",
            (configName _x) call _fnc_sub,
            (_x >> "armor") call _fnc_n,
            (_x >> "passThrough") call _fnc_n
        ];
    } forEach ("true" configClasses (_ii >> "HitpointsProtectionInfo"));
    ["IA", _classe, _prot joinString ";"] call _fnc_pedacos;

    private _oticas = [];
    {
        _oticas pushBack format ["%1:%2:%3:%4:%5",
            (configName _x) call _fnc_sub,
            (_x >> "opticsZoomMin") call _fnc_n,
            (_x >> "opticsZoomMax") call _fnc_n,
            (_x >> "opticsZoomInit") call _fnc_n,
            ((getArray (_x >> "visionMode")) joinString "/") call _fnc_sub
        ];
    } forEach ("true" configClasses (_ii >> "OpticsModes"));
    ["IO", _classe, _oticas joinString ";"] call _fnc_pedacos;

    private _dist = getArray (_ii >> "discreteDistance");
    if (count _dist > 0) then {
        ["ID", _classe, (_dist joinString ";")] call _fnc_pedacos;
    };

    private _coef = _ii >> "AmmoCoef";
    if (isClass _coef) then {
        diag_log text (format ["<<A3ITEM>>IS|%1|%2|%3|%4|%5",
            _classe,
            (_coef >> "hit") call _fnc_n,
            (_coef >> "initSpeed") call _fnc_n,
            (_coef >> "audibleFire") call _fnc_n,
            (_coef >> "visibleFire") call _fnc_n
        ]);
    };

    _nItens = _nItens + 1;
} forEach _itens;

private _oculos = "getNumber (_x >> 'scope') >= 2" configClasses (configFile >> "CfgGlasses");
private _nOculos = 0;

{
    private _cfg = _x;
    diag_log text (format ["<<A3ITEM>>G|%1|%2|%3|%4|%5",
        configName _cfg,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        (configSourceMod _cfg) call _fnc_lim,
        (_cfg >> "mass") call _fnc_n,
        (getText (_cfg >> "picture")) call _fnc_lim
    ]);
    _nOculos = _nOculos + 1;
} forEach _oculos;

private _mochilas = "
    (getNumber (_x >> 'scope') >= 2) && {getNumber (_x >> 'isBackpack') > 0}
" configClasses (configFile >> "CfgVehicles");
private _nMochilas = 0;

{
    private _cfg = _x;
    diag_log text (format ["<<A3ITEM>>B|%1|%2|%3|%4|%5|%6",
        configName _cfg,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        (configSourceMod _cfg) call _fnc_lim,
        (_cfg >> "maximumLoad") call _fnc_n,
        (_cfg >> "mass") call _fnc_n,
        (getText (_cfg >> "picture")) call _fnc_lim
    ]);
    _nMochilas = _nMochilas + 1;
} forEach _mochilas;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3ITEM>>FIM|%1|%2|%3|%4", _nItens, _nOculos, _nMochilas, _dt toFixed 1]);

private _msg = format ["DUMP ITENS OK em %1 s - %2 itens, %3 oculos, %4 mochilas. Rode: python scripts/arma3/parse-itens.py",
    _dt toFixed 1, _nItens, _nOculos, _nMochilas];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
