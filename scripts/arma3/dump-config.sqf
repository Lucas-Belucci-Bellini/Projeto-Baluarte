private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_num = { _this toFixed 6 };

private _fnc_pedacos = {
    params ["_marca", "_classe", "_texto"];
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3DUMP>>%1|%2|%3", _marca, _classe, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3DUMP>>INICIO|v2";

private _armas = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getNumber (_x >> 'type')) in [1, 2, 4]}
" configClasses (configFile >> "CfgWeapons");

private _magsUsados = [];
private _nArmas = 0;

{
    private _cfg = _x;
    private _classe = configName _cfg;

    private _mags = (getArray (_cfg >> "magazines") select { _x isEqualType "" }) apply { toLower _x };
    { if !(_x in _magsUsados) then { _magsUsados pushBack _x } } forEach _mags;

    private _modosTxt = [];
    {
        private _m = _x;
        private _cfgM = if (_m == "this") then { _cfg } else { _cfg >> _m };
        if (_m == "this" || {isClass _cfgM}) then {
            _modosTxt pushBack format ["%1:%2:%3:%4:%5",
                _m call _fnc_lim,
                (getNumber (_cfgM >> "reloadTime")) call _fnc_num,
                (getNumber (_cfgM >> "dispersion")) call _fnc_num,
                getNumber (_cfgM >> "autoFire"),
                getNumber (_cfgM >> "burst")
            ];
        };
    } forEach (getArray (_cfg >> "modes") select { _x isEqualType "" });

    private _desc = (getText (_cfg >> "descriptionShort")) call _fnc_lim;
    if (count _desc > 90) then { _desc = _desc select [0, 90] };

    diag_log text (format ["<<A3DUMP>>W|%1|%2|%3|%4|%5|%6|%7|%8",
        _classe,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        getNumber (_cfg >> "type"),
        (configSourceMod _cfg) call _fnc_lim,
        (getNumber (_cfg >> "WeaponSlotsInfo" >> "mass")) call _fnc_num,
        getNumber (_cfg >> "maxZeroing"),
        (getNumber (_cfg >> "initSpeed")) call _fnc_num,
        _desc
    ]);

    diag_log text (format ["<<A3DUMP>>WP|%1|%2|%3",
        _classe,
        (getText (_cfg >> "picture")) call _fnc_lim,
        (getText (_cfg >> "model")) call _fnc_lim
    ]);

    ["WM", _classe, _mags joinString ";"] call _fnc_pedacos;
    ["WF", _classe, _modosTxt joinString ";"] call _fnc_pedacos;

    _nArmas = _nArmas + 1;
} forEach _armas;

private _ammosUsados = [];
private _nMags = 0;

{
    private _cfg = configFile >> "CfgMagazines" >> _x;
    if (isClass _cfg) then {
        private _ammo = (getText (_cfg >> "ammo")) call _fnc_lim;
        if (_ammo != "" && {!(toLower _ammo in _ammosUsados)}) then {
            _ammosUsados pushBack toLower _ammo;
        };
        diag_log text (format ["<<A3DUMP>>M|%1|%2|%3|%4|%5|%6|%7",
            configName _cfg,
            (getText (_cfg >> "displayName")) call _fnc_lim,
            _ammo,
            getNumber (_cfg >> "count"),
            (getNumber (_cfg >> "initSpeed")) call _fnc_num,
            (getNumber (_cfg >> "mass")) call _fnc_num,
            (configSourceMod _cfg) call _fnc_lim
        ]);
        _nMags = _nMags + 1;
    };
} forEach _magsUsados;

private _nAmmo = 0;
{
    private _cfg = configFile >> "CfgAmmo" >> _x;
    if (isClass _cfg) then {
        diag_log text (format ["<<A3DUMP>>A|%1|%2|%3|%4|%5|%6|%7|%8|%9|%10|%11",
            configName _cfg,
            (getNumber (_cfg >> "hit")) call _fnc_num,
            (getNumber (_cfg >> "indirectHit")) call _fnc_num,
            (getNumber (_cfg >> "indirectHitRange")) call _fnc_num,
            (getNumber (_cfg >> "caliber")) call _fnc_num,
            (getNumber (_cfg >> "airFriction")) call _fnc_num,
            (getNumber (_cfg >> "typicalSpeed")) call _fnc_num,
            getNumber (_cfg >> "explosive"),
            getNumber (_cfg >> "deflecting"),
            getNumber (_cfg >> "visibleFire"),
            getNumber (_cfg >> "audibleFire")
        ]);
        _nAmmo = _nAmmo + 1;
    };
} forEach _ammosUsados;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3DUMP>>FIM|%1|%2|%3|%4", _nArmas, _nMags, _nAmmo, _dt toFixed 1]);

private _msg = format ["DUMP OK em %1 s - %2 armas, %3 carregadores, %4 municoes. Rode: python scripts/arma3/parse-dump.py",
    _dt toFixed 1, _nArmas, _nMags, _nAmmo];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
