from tarfile import DIRTYPE
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

from sqlalchemy.orm.collections import prepare_instrumentation

app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:UmaKiran@localhost:5432/CivicSpark'
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://rukshik:UmaKiran12@civicspark.postgres.database.azure.com:5432/CivicSpark"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
CORS(app)


# * Database Models
class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    profile_picture_url = db.Column(db.String(1000))


class Organization(db.Model):
    __tablename__ = "organizations"
    org_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    logo_url = db.Column(db.String(255))
    description = db.Column(db.Text)


class VolunteeringOpportunity(db.Model):
    __tablename__ = "volunteering_opportunities"
    opp_id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(
        db.Integer, db.ForeignKey("organizations.org_id"), nullable=False
    )
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(1000))
    category = db.Column(db.String(1000))
    date = db.Column(db.String(255))
    signup_url = db.Column(db.String(1000))
    length = db.Column(db.String(255))
    opp_image = db.Column(db.Text)
    zip_code = db.Column(db.Text)
    skills_required = db.Column(db.Text)

    organization = db.relationship("Organization", backref="volunteering_opportunities")


class Favorite(db.Model):
    __tablename__ = "favorites"
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    org_id = db.Column(
        db.Integer, db.ForeignKey("organizations.org_id"), primary_key=True
    )

    organization = db.relationship("Organization", backref="favorites")


class SavedOpportunity(db.Model):
    __tablename__ = "saved_opportunities"
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    opp_id = db.Column(
        db.Integer, db.ForeignKey("volunteering_opportunities.opp_id"), primary_key=True
    )


class PastVolunteeringOpportunity(db.Model):
    __tablename__ = "past_volunteering_opportunities"
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    opp_id = db.Column(
        db.Integer, db.ForeignKey("volunteering_opportunities.opp_id"), primary_key=True
    )
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)


class AcceptedEvent(db.Model):
    __tablename__ = "accepted_events"
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    opp_id = db.Column(
        db.Integer, db.ForeignKey("volunteering_opportunities.opp_id"), primary_key=True
    )
    accepted_at = db.Column(db.DateTime, default=datetime.utcnow)


# * API Routes


## Add User
@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.json
    email = data.get("email")
    name = data.get("name")
    profile_picture_url = data.get("profile_picture_url")

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 200

    new_user = User(email=email, name=name, profile_picture_url=profile_picture_url)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User added successfully"}), 201


## Get Volunteering Opportunities
@app.route("/opportunities", methods=["GET"])
def get_opportunities():
    category_filter = request.args.getlist("category[]")
    skills_filter = request.args.getlist("skills[]")
    zip_code_filter = request.args.get("zip_code")
    opportunity_id = request.args.get("id")

    if opportunity_id:
        opportunity = VolunteeringOpportunity.query.get(opportunity_id)
        if not opportunity:
            return jsonify({"error": "Opportunity not found"}), 404

        # Check if user has accepted this opportunity
        user_id = request.args.get("user_id")
        is_accepted = False
        if user_id:
            is_accepted = (
                AcceptedEvent.query.filter_by(
                    user_id=user_id, opp_id=opportunity.opp_id
                ).first()
                is not None
            )

        return jsonify(
            {
                "id": opportunity.opp_id,
                "title": opportunity.title,
                "description": opportunity.description,
                "location": opportunity.location,
                "category": opportunity.category,
                "date": opportunity.date,
                "signup_url": opportunity.signup_url,
                "org_id": opportunity.org_id,
                "length": opportunity.length,
                "image_link": opportunity.opp_image,
                "zip_code": opportunity.zip_code,
                "skills_required": opportunity.skills_required,
                "organization": {
                    "name": opportunity.organization.name,
                    "logo_url": opportunity.organization.logo_url,
                },
                "is_accepted": is_accepted,
            }
        )

    query = VolunteeringOpportunity.query

    if category_filter:
        query = query.filter(
            db.or_(
                *[
                    VolunteeringOpportunity.category.ilike(f"%{category}%")
                    for category in category_filter
                ]
            )
        )

    if skills_filter:
        query = query.filter(
            db.or_(
                *[
                    VolunteeringOpportunity.skills_required.ilike(f"%{skill}%")
                    for skill in skills_filter
                ]
            )
        )

    if zip_code_filter:
        query = query.filter(VolunteeringOpportunity.zip_code == zip_code_filter)

    opportunities = query.all()

    return jsonify(
        [
            {
                "id": opp.opp_id,
                "title": opp.title,
                "description": opp.description,
                "location": opp.location,
                "category": opp.category,
                "date": opp.date,
                "signup_url": opp.signup_url,
                "org_id": opp.org_id,
                "length": opp.length,
                "image_link": opp.opp_image,
                "zip_code": opp.zip_code,
                "skills_required": opp.skills_required,
                "organization": {
                    "name": opp.organization.name,
                    "logo_url": opp.organization.logo_url,
                },
            }
            for opp in opportunities
        ]
    )


## Get User Dashboard
@app.route("/user/dashboard", methods=["GET"])
def get_dashboard():
    user_id = request.args.get("user_id")

    past_opps = (
        db.session.query(
            PastVolunteeringOpportunity,
            VolunteeringOpportunity.title,
            VolunteeringOpportunity.category,
            VolunteeringOpportunity.length,
            Organization.name.label("org_name"),
        )
        .join(
            VolunteeringOpportunity,
            PastVolunteeringOpportunity.opp_id == VolunteeringOpportunity.opp_id,
        )
        .join(Organization, VolunteeringOpportunity.org_id == Organization.org_id)
        .filter(PastVolunteeringOpportunity.user_id == user_id)
        .all()
    )

    saved_opps = (
        db.session.query(
            SavedOpportunity,
            VolunteeringOpportunity.title,
            VolunteeringOpportunity.date,
            VolunteeringOpportunity.location,
            VolunteeringOpportunity.category,
            VolunteeringOpportunity.length,
            VolunteeringOpportunity.signup_url,
            Organization.name.label("org_name"),
        )
        .join(
            VolunteeringOpportunity,
            SavedOpportunity.opp_id == VolunteeringOpportunity.opp_id,
        )
        .join(Organization, VolunteeringOpportunity.org_id == Organization.org_id)
        .filter(SavedOpportunity.user_id == user_id)
        .all()
    )

    favorites = Favorite.query.filter_by(user_id=user_id).all()

    return jsonify(
        {
            "pastOpportunities": [
                {
                    "id": opp.PastVolunteeringOpportunity.opp_id,
                    "title": opp.title,
                    "completed_at": opp.PastVolunteeringOpportunity.completed_at,
                    "category": opp.category,
                    "organization": opp.org_name,
                    "length": opp.length,
                }
                for opp in past_opps
            ],
            "savedOpportunities": [
                {
                    "id": opp.SavedOpportunity.opp_id,
                    "title": opp.title,
                    "signup_url": opp.signup_url,
                    "date": opp.date,
                    "location": opp.location,
                    "category": opp.category,
                    "organization": opp.org_name,
                    "length": opp.length,
                }
                for opp in saved_opps
            ],
            "favorites": [
                {
                    "id": fav.org_id,
                    "name": fav.organization.name,
                    "description": fav.organization.description,
                }
                for fav in favorites
            ],
        }
    )


## Save an Opportunity
@app.route("/saved", methods=["POST"])
def save_opportunity():
    data = request.json
    user_id = data.get("user_id")
    opp_id = data.get("opp_id")

    existing_saved = SavedOpportunity.query.filter_by(
        user_id=user_id, opp_id=opp_id
    ).first()
    if existing_saved:
        return jsonify({"message": "Opportunity already saved"}), 200

    new_saved = SavedOpportunity(user_id=user_id, opp_id=opp_id)
    db.session.add(new_saved)
    db.session.commit()
    return jsonify({"message": "Opportunity saved successfully"}), 201


## Add to Favorites
@app.route("/favorites", methods=["POST"])
def add_favorite():
    data = request.json
    user_id = data.get("user_id")
    org_id = data.get("org_id")

    existing_fav = Favorite.query.filter_by(user_id=user_id, org_id=org_id).first()
    if existing_fav:
        return jsonify({"message": "Organization already favorited"}), 200

    new_fav = Favorite(user_id=user_id, org_id=org_id)
    db.session.add(new_fav)
    db.session.commit()
    return jsonify({"message": "Organization favorited successfully"}), 201


## Get User Accepted Events
@app.route("/user/accepted_events", methods=["GET"])
def get_accepted_events():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    events = (
        db.session.query(
            VolunteeringOpportunity,
            Organization.name.label("org_name"),
            VolunteeringOpportunity.length,
        )
        .join(AcceptedEvent, VolunteeringOpportunity.opp_id == AcceptedEvent.opp_id)
        .join(Organization, VolunteeringOpportunity.org_id == Organization.org_id)
        .filter(AcceptedEvent.user_id == user_id)
        .all()
    )

    result = [
        {
            "id": event.VolunteeringOpportunity.opp_id,
            "title": event.VolunteeringOpportunity.title,
            "description": event.VolunteeringOpportunity.description,
            "location": event.VolunteeringOpportunity.location,
            "date": (
                event.VolunteeringOpportunity.date.strftime("%Y-%m-%d")
                if event.VolunteeringOpportunity.date
                else None
            ),
            "organization": event.org_name,
            "length": event.length,
        }
        for event in events
    ]

    return jsonify(result)


## Get User Profile
@app.route("/user/profile", methods=["GET"])
def get_user_profile():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # total_hours = (
    #     db.session.query(db.func.sum(VolunteeringOpportunity.length))
    #     .join(
    #         PastVolunteeringOpportunity,
    #         PastVolunteeringOpportunity.opp_id == VolunteeringOpportunity.opp_id,
    #     )
    #     .filter(PastVolunteeringOpportunity.user_id == user_id)
    #     .scalar()
    # )

    # total_hours = total_hours or 0

    total_hours = 0

    return jsonify(
        {
            "name": user.name,
            "email": user.email,
            "profile_picture_url": user.profile_picture_url,
            "total_hours": total_hours,
        }
    )


## Update User Profile
@app.route("/user/update_profile", methods=["POST"])
def update_profile():
    data = request.json
    user_id = data.get("user_id")
    name = data.get("name")
    email = data.get("email")
    profile_picture_url = data.get("profile_picture_url")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.name = name
    user.email = email
    user.profile_picture_url = profile_picture_url

    db.session.commit()

    return jsonify({"message": "Profile updated successfully"}), 200


## Delete User Profile
@app.route("/user/delete", methods=["DELETE"])
def delete_user():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    SavedOpportunity.query.filter_by(user_id=user_id).delete()
    PastVolunteeringOpportunity.query.filter_by(user_id=user_id).delete()
    AcceptedEvent.query.filter_by(user_id=user_id).delete()
    Favorite.query.filter_by(user_id=user_id).delete()

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200


## Get User ID by Email
@app.route("/user/get_user_id_by_email", methods=["GET"])
def get_user_id_by_email():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user_id": user.user_id})


## Get Organization Details
@app.route("/organization/<int:org_id>", methods=["GET"])
def get_organization_details(org_id):
    organization = Organization.query.get(org_id)

    if not organization:
        return jsonify({"error": "Organization not found"}), 404

    # Fetch opportunities, sorted by date (closest first)
    opportunities = (
        VolunteeringOpportunity.query.filter_by(org_id=org_id)
        .order_by(VolunteeringOpportunity.date.asc())
        .all()
    )

    return jsonify(
        {
            "organization": {
                "id": organization.org_id,
                "name": organization.name,
                "logo_url": organization.logo_url,
                "description": organization.description,
            },
            "opportunities": [
                {
                    "id": opp.opp_id,
                    "title": opp.title,
                    "category": opp.category,
                    "date": opp.date,
                    "location": opp.location,
                    "length": opp.length,
                }
                for opp in opportunities
            ],
        }
    )


# Accept an opportunity for a user
@app.route("/opportunities/accept", methods=["POST"])
def accept_opportunity():
    data = request.json
    user_id = data.get("user_id")
    opp_id = data.get("opp_id")

    if not user_id or not opp_id:
        return jsonify({"error": "Missing user_id or opp_id"}), 400

    # Check if already accepted
    existing = AcceptedEvent.query.filter_by(user_id=user_id, opp_id=opp_id).first()
    if existing:
        return jsonify({"message": "Already accepted"}), 200

    new_accepted = AcceptedEvent(user_id=user_id, opp_id=opp_id)
    db.session.add(new_accepted)
    db.session.commit()

    return jsonify({"message": "Opportunity accepted successfully"}), 201


# Unaccept an opportunity for a user
@app.route("/opportunities/unaccept", methods=["POST"])
def unaccept_opportunity():
    data = request.json
    user_id = data.get("user_id")
    opp_id = data.get("opp_id")

    if not user_id or not opp_id:
        return jsonify({"error": "Missing user_id or opp_id"}), 400

    # Find the accepted event
    accepted_event = AcceptedEvent.query.filter_by(
        user_id=user_id, opp_id=opp_id
    ).first()
    if not accepted_event:
        return jsonify({"message": "Opportunity was not accepted"}), 200

    # Remove the accepted event
    db.session.delete(accepted_event)
    db.session.commit()

    return jsonify({"message": "Opportunity unaccepted successfully"}), 200


## Check if an organization is favorited
@app.route("/favorites/check", methods=["GET"])
def check_favorite():
    user_id = request.args.get("user_id")
    org_id = request.args.get("org_id")

    if not user_id or not org_id:
        return jsonify({"error": "Missing user_id or org_id"}), 400

    is_favorited = (
        Favorite.query.filter_by(user_id=user_id, org_id=org_id).first() is not None
    )
    return jsonify({"favorited": is_favorited}), 200


## Remove an organization from favorites
@app.route("/favorites/remove", methods=["POST"])
def remove_favorite():
    data = request.json
    user_id = data.get("user_id")
    org_id = data.get("org_id")

    if not user_id or not org_id:
        return jsonify({"error": "Missing user_id or org_id"}), 400

    favorite = Favorite.query.filter_by(user_id=user_id, org_id=org_id).first()

    if not favorite:
        return jsonify({"message": "Organization is not favorited"}), 200

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Organization unfavorited successfully"}), 200


## Remove a saved opportunity
@app.route("/saved/remove", methods=["POST"])
def remove_saved_opportunity():
    data = request.get_json()
    user_id = data.get("user_id")
    opp_id = data.get("opp_id")

    if not user_id or not opp_id:
        return jsonify({"error": "Missing user_id or opp_id"}), 400

    saved_opportunity = SavedOpportunity.query.filter_by(
        user_id=user_id, opp_id=opp_id
    ).first()
    if saved_opportunity:
        db.session.delete(saved_opportunity)
        db.session.commit()
        return jsonify({"message": "Opportunity unsaved successfully"}), 200

    return jsonify({"error": "Opportunity not found in saved list"}), 404


## Check if an opportunity is saved
@app.route("/saved/check", methods=["GET"])
def check_saved_opportunity():
    user_id = request.args.get("user_id")
    opp_id = request.args.get("opp_id")

    if not user_id or not opp_id:
        return jsonify({"error": "Missing user_id or opp_id"}), 400

    saved_opportunity = (
        SavedOpportunity.query.filter_by(user_id=user_id, opp_id=opp_id).first()
        is not None
    )
    return jsonify({"saved": saved_opportunity}), 200


# * Main Application Runner
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database tables created successfully.")
    app.run(debug=True)
