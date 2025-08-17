## Backend code for Sillico Battles 2025
## 
## Copyright (C) 2025 Trayambak Rai (xtrayambak at disroot dot org)

# Flask for the HTTP server
from flask import Flask, request, jsonify
from flask_cors import *

# SimpleSQLite for the ORM
from simplesqlite import SimpleSQLite
from simplesqlite.model import *

# Other STL utils
import secrets
import time
import logging

logging.basicConfig(level = logging.DEBUG)

AdministratorRole = 0
ParticipantRole = 1

TokenLifetimeSecs = 3600

# Exceptions
class ExpiredToken(Exception):
    pass

# ORM models
class User(Model):
    id = Integer(primary_key = True)
    name = Text(not_null = True, unique = True)
    password = Text(not_null = True, unique = False)
    role = Integer()

class Token(Model):
    code = Text(not_null = True, unique = True, primary_key = True)
    created_at = Integer(not_null = True, unique = False)
    uid = Integer(not_null = True)

class Event(Model):
    name = Text(not_null = True, unique = False, primary_key = True)
    date = Integer(not_null = True, unique = False, primary_key = False)
    end = Integer(not_null = True, unique = False, primary_key = False)
    venue = Text(not_null = True, unique = False, primary_key = False)
    participants = Text(not_null = True, unique = False)

def parse_participants(value: str) -> list[int]:
    res = []

    for id in value.split(';'):
        res.append(int(id))

    return res

def close_db(db: SimpleSQLite):
    print("closed db")
    # db.close()

def mk_db_structs() -> SimpleSQLite:
    gdb = SimpleSQLite("data.sqlite", "a")
    Event.attach(gdb)
    User.attach(gdb)
    Token.attach(gdb)
    
    try:
        Event.create()
    except: pass

    try:
        User.create()
    except: pass

    try:
        Token.create()
    except: pass

    try:
        User.insert(User(
            id = 0,
            name = "Administrator",
            password = "Test",
            role = AdministratorRole
        ))
    except:
        pass

    try:
        Event.insert(Event(
            name = "Example Fest",
            date = 1755400500000,
            end = 1755419400000,
            venue = "Example School Noida",
            participants = "0;1"
        ))
    except: print("skibidi error"); pass

    gdb.commit()

app = Flask("event-backend")
CORS(app)

mk_db_structs()

def generate_token_for_user(id: int) -> dict:
    created_at = int(time.time())
    code = secrets.token_hex(32)

    Token.insert(
        Token(
            code = code,
            created_at = created_at,
            uid = id
        )
    )
    
    return {
            "code": code,
            "expires_at": created_at + TokenLifetimeSecs
    }

def find_user(uid: int) -> User:
    for user in User.select():
        if user.id == uid:
            return user

def get_token_privilege(token: str) -> int:
    current_time = int(time.time())
    db = SimpleSQLite("data.sqlite", "r")
    Token.attach(db)
    User.attach(db)
    
    for tok in Token.select():
        if token != tok.code:
            continue

        if (tok.created_at + TokenLifetimeSecs) < current_time:
            raise ExpiredToken(current_time - (tok.created_at + TokenLifetimeSecs))
        
        user = find_user(tok.uid)
        if not user:
            raise ValueError("BUG: No such user exists with the token provided")

        close_db(db)
        return user.role

    close_db(db)

def verify_creds():
    # im missing nim template abuse already :(
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "MISSINGAUTHHEADER"}), 400

    if not token.startswith("Bearer "):
        return jsonify({"error": "INVALIDAUTHHEADER"}), 400
    
    # print(token)
    auth_token = token.split(" ", 1)[1]
    # print(auth_token)

    try:
        user = get_token_privilege(auth_token)

        if user == None:
            return jsonify({"error": "INVALIDTOKEN"}), 401
        
        if user != AdministratorRole:
            return jsonify({"error": "UNPRIVILEGED"}), 401
    except ExpiredToken:
        return jsonify({"error": "EXPIREDTOKEN"}), 401

@app.route("/auth/login", methods = ["POST"])
def login():
    db = SimpleSQLite("data.sqlite", "a")
    User.attach(db)
    Token.attach(db)
    
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    
    for user in User.select():
        if user.name != username:
            continue

        if user.password != password:
            continue
        
        token = generate_token_for_user(user.id)
        db.close()
        return jsonify({
            "details": {
                "username": user.name,
                "password": user.password,
                "role": user.role,
            },
            "token": token 
        }), 200
    
    close_db(db)
    return jsonify({
        "error": "INVALIDLOGIN"
    }), 401

@app.route("/users/list", methods = ["GET"])
# TODO: Call this when admin logs into dashboard
def get_users():
    intercept = verify_creds()
    if intercept:
        return intercept

    db = SimpleSQLite("data.sqlite", "r")
    User.attach(db)
    payload = {"users": []}

    for user in User.select():
        payload["users"].append({
            "name": user.name,
            "role": user.role,
            "id": user.id
        })
    
    close_db(db)
    return jsonify(payload), 200

@app.route("/events/list", methods = ["GET"])
def events_list():
    intercept = verify_creds()
    if intercept:
        return intercept
    
    db = SimpleSQLite("data.sqlite", "r")
    Event.attach(db)
    payload = {"events": []}

    for event in Event.select():
        payload["events"].append(
            {
                "name": event.name,
                "date": event.date,
                "end": event.end,
                "venue": event.venue,
                "participants": parse_participants(event.participants)
            }
        )
    
    close_db(db)
    return jsonify(payload), 200

@app.route("/events/create", methods = ["POST"])
def events_create():
    intercept = verify_creds()
    if intercept:
        return intercept

    data = request.get_json()

    event = data["event"]
    event_name = event["name"]
    event_date = event["date"]
    event_participants = event["participants"]
    event_venue = event["venue"]

    db = SimpleSQLite("data.sqlite", "a")
    Event.attach(db)

    Event.insert(
        Event(
            name = event_name,
            date = event_date,
            participants = ';'.join(event_participants),
            venue = event_venue
        )
    )
    db.commit()
    close_db(db)

    return "", 200
