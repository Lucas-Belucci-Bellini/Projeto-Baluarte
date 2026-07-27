private _alvos = [
    "arifle_MX_F",
    "hgun_P07_F",
    "launch_RPG32_F"
];

private _passos = 24;
private _prefixo = "a3tt";
private _folga = 2.2;
private _altura = 0.35;

if (count _alvos == 0) exitWith {
    hint "turntable: a lista _alvos esta vazia";
    "lista vazia"
};

[_alvos, _passos, _prefixo, _folga, _altura] spawn {
    params ["_alvos", "_passos", "_prefixo", "_folga", "_altura"];

    private _fnc_modelo = {
        private _c = _this;
        private _m = "";
        {
            private _e = configFile >> _x >> _c >> "model";
            if (_m == "" && { isText _e }) then { _m = getText _e };
        } forEach ["CfgWeapons", "CfgMagazines", "CfgAmmo", "CfgVehicles", "CfgGlasses"];
        if (_m == "") exitWith { "" };
        if !((toLower _m) endsWith ".p3d") then { _m = _m + ".p3d" };
        _m
    };

    private _base = getPosATL player;
    private _centro = [(_base select 0) + 25, _base select 1, (_base select 2) + 50];

    private _cam = "camera" camCreate _centro;
    _cam cameraEffect ["internal", "back"];
    showCinemaBorder false;

    private _ok = 0;
    private _falhas = 0;

    {
        private _classe = _x;
        private _p3d = _classe call _fnc_modelo;

        if (_p3d == "") then {
            diag_log text (format ["<<A3TT>>ERRO|%1|sem model no config", _classe]);
            _falhas = _falhas + 1;
        } else {
            private _obj = createSimpleObject [_p3d, _centro, true];

            if (isNull _obj) then {
                diag_log text (format ["<<A3TT>>ERRO|%1|createSimpleObject falhou em %2",
                    _classe, _p3d]);
                _falhas = _falhas + 1;
            } else {
                private _bb = boundingBoxReal _obj;
                private _min = _bb select 0;
                private _max = _bb select 1;
                private _tam = 0;
                {
                    private _d = (_max select _x) - (_min select _x);
                    if (_d > _tam) then { _tam = _d };
                } forEach [0, 1, 2];
                if (_tam <= 0) then { _tam = 1 };
                private _dist = _tam * _folga;

                diag_log text (format ["<<A3TT>>OBJ|%1|%2|%3|%4",
                    _classe, _p3d, _tam toFixed 3, _passos]);

                for "_i" from 0 to (_passos - 1) do {
                    private _ang = 360 * _i / _passos;
                    _cam camSetPos [
                        (_centro select 0) + (_dist * sin _ang),
                        (_centro select 1) + (_dist * cos _ang),
                        (_centro select 2) + (_tam * _altura)
                    ];
                    _cam camSetTarget _obj;
                    _cam camCommit 0;
                    sleep 0.15;

                    private _arq = format ["%1_%2_%3.png", _prefixo, _classe, _i];
                    screenshot _arq;
                    diag_log text (format ["<<A3TT>>IMG|%1|%2|%3", _classe, _i, _arq]);
                    sleep 0.1;
                };

                deleteVehicle _obj;
                _ok = _ok + 1;
            };
        };
        sleep 0.1;
    } forEach _alvos;

    _cam cameraEffect ["terminate", "back"];
    camDestroy _cam;

    diag_log text (format ["<<A3TT>>FIM|%1|%2|%3", _ok, _falhas, _passos]);

    private _msg = format ["TURNTABLE: %1 objetos OK, %2 falharam, %3 fotos cada. Os PNG estao na raiz do Arma 3.",
        _ok, _falhas, _passos];
    hint _msg;
    systemChat _msg;
    copyToClipboard _msg;
};

systemChat "TURNTABLE rodando - DESPAUSE o jogo, ele tira uma foto por quadro";
"turntable iniciado - despause o jogo"
