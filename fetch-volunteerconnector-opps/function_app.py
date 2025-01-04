import logging
import azure.functions as func
import requests
from bs4 import BeautifulSoup
import lxml

# from flask import Flask, request, jsonify
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS
from sqlalchemy import (
    create_engine,
    func as db_func,
    Column,
    Integer,
    String,
    Text,
    # DateTime,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

app = func.FunctionApp()
# flask_app = Flask(__name__)
# flask_app.config["SQLALCHEMY_DATABASE_URI"] = (
#     "postgresql://postgres:UmaKiran@localhost:5432/CivicSpark"
# )
# # flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rukshik:UmaKiran12@civicspark.postgres.database.azure.com:5432/CivicSpark'
# flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
Base = declarative_base()
# engine = create_engine("postgresql://postgres:UmaKiran@localhost:5432/CivicSpark")
engine = create_engine(
    "postgresql://rukshik:UmaKiran12@civicspark.postgres.database.azure.com:5432/CivicSpark"
)
Session = sessionmaker(bind=engine)
session = Session()
# CORS(flask_app)


class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    profile_picture_url = Column(String(255))


class Organization(Base):
    __tablename__ = "organizations"
    org_id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    logo_url = Column(String(255))
    description = Column(Text)


class VolunteeringOpportunity(Base):
    __tablename__ = "volunteering_opportunities"
    opp_id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.org_id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(String(1000))
    category = Column(String(1000))
    date = Column(String(255))
    signup_url = Column(String(1000))
    length = Column(String(255))
    opp_image = Column(Text)
    zip_code = Column(Text)
    skills_required = Column(Text)

    organization = relationship("Organization", backref="volunteering_opportunities")


@app.function_name(name="fetchVolnteerConnectorOpps")
@app.schedule(
    schedule="0 0 * * * *",
    arg_name="fetchVolnteerConnectorOpps",
    run_on_startup=True,
    use_monitor=False,
)
def fetchVolnteerConnectorOpps(
    fetchVolnteerConnectorOpps: func.TimerRequest,
) -> None:
    if fetchVolnteerConnectorOpps.past_due:
        logging.info("The timer is past due!")
    logging.info("Fetching opportunities from VolunteerConnector\n\n")

    base_url = "https://www.volunteerconnector.org/api/search/?page="
    page = 1
    total_opportunities = 0
    requests_session = requests.Session()

    while True:
        logging.info(f"Fetching page {page}...\n\n")
        response = requests.get(f"{base_url}{page}")
        data = response.json()
        opportunities = data.get("results", [])
        logging.info(f"Found {len(opportunities)} opportunities on this page\n\n")
        if not opportunities:
            break

        for opp in opportunities:
            org_data = opp.get("organization", {})
            org_name = org_data.get("name")
            if org_name:
                org_desc = None
                org_response = requests_session.get(org_data.get("url"))
                org_soup = BeautifulSoup(org_response.text, "lxml")

                desc_div = org_soup.find("div", class_="description content")
                if desc_div:
                    p_element = desc_div.find("p")
                    if p_element:
                        org_desc = p_element.get_text().strip()

                existing_org = (
                    session.query(Organization).filter_by(name=org_name).first()
                )
                if existing_org:
                    if (
                        existing_org.logo_url != org_data.get("logo")
                        or existing_org.description != org_desc
                    ):
                        existing_org.logo_url = org_data.get("logo")
                        existing_org.description = org_desc
                        session.commit()
                    org_id = existing_org.org_id
                else:
                    new_org = Organization(
                        org_id=session.query(db_func.max(Organization.org_id)).scalar()
                        + 1,
                        name=org_name,
                        logo_url=("https:" + org_data.get("logo")),
                        description=org_desc,
                    )
                    session.add(new_org)
                    org_id = new_org.org_id
                    session.commit()

            opp_id = opp.get("id")
            if opp_id:
                opp_url = opp.get("url")
                opp_response = requests_session.get(opp_url)
                opp_soup = BeautifulSoup(opp_response.text, "lxml")

                location = None
                location_div = opp_soup.find("div", class_="location")
                if location_div:
                    location = "".join(location_div.find_all(text=True)).strip()
                    location = location.replace("[map]", "").strip()

                existing_opp = (
                    session.query(VolunteeringOpportunity)
                    .filter_by(opp_id=opp_id)
                    .first()
                )
                if existing_opp:
                    if (
                        existing_opp.title != opp.get("title")
                        or existing_opp.description != opp.get("description")
                        or existing_opp.signup_url != opp.get("url") + "/apply"
                        or existing_opp.location != location
                        or existing_opp.date != opp.get("dates")
                        or existing_opp.length != opp.get("duration")
                    ):
                        existing_opp.title = opp.get("title")
                        existing_opp.description = opp.get("description")
                        existing_opp.signup_url = opp.get("url") + "/apply"
                        existing_opp.location = location
                        existing_opp.org_id = org_id
                        existing_opp.date = opp.get("dates")
                        existing_opp.length = opp.get("duration")
                        session.commit()
                else:
                    new_opp = VolunteeringOpportunity(
                        opp_id=opp_id,
                        title=opp.get("title"),
                        description=opp.get("description"),
                        location=location,
                        signup_url=opp.get("url") + "/apply",
                        org_id=org_id,
                        date=opp.get("dates"),
                        length=opp.get("duration"),
                    )
                    session.add(new_opp)
                    session.commit()

        total_opportunities += len(opportunities)
        page += 1
