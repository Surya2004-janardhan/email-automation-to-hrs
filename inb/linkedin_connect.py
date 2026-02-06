#!/usr/bin/env python3
"""
LinkedIn Connection Automation Script
Searches for relevant profiles and sends connection requests automatically.
"""

import os
import sys
import time
import argparse

# Add the inb directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'inb'))

from api.linkedin_api import LinkedIn
from api.invitation.status import Invitation, Person


def main():
    parser = argparse.ArgumentParser(description='LinkedIn Connection Automation')
    parser.add_argument('--email', required=True, help='LinkedIn email')
    parser.add_argument('--password', required=True, help='LinkedIn password')
    parser.add_argument('--keyword', default='Software Engineer', help='Search keyword')
    parser.add_argument('--limit', type=int, default=20, help='Max connections to send')
    parser.add_argument('--message', default='', help='Connection message (max 300 chars)')
    parser.add_argument('--refresh-cookies', action='store_true', help='Force refresh cookies')
    parser.add_argument('--nofollow', action='store_true', help='Unfollow after connecting')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🔗 LINKEDIN CONNECTION AUTOMATION")
    print("=" * 60)
    print(f"Email: {args.email}")
    print(f"Keyword: {args.keyword}")
    print(f"Limit: {args.limit}")
    print(f"Message: {args.message[:50]}..." if len(args.message) > 50 else f"Message: {args.message or '(none)'}")
    print()
    
    # Default connection message for job seekers
    if not args.message:
        args.message = (
            "Hi! I'm a motivated engineer looking for SDE/Full Stack/AI roles. "
            "I'd love to connect and learn about opportunities at your company. "
            "Thank you!"
        )
    
    try:
        # Initialize LinkedIn client
        print("🔐 Authenticating with LinkedIn...")
        linkedin = LinkedIn(
            args.email,
            args.password,
            authenticate=True,
            refresh_cookies=args.refresh_cookies,
            debug=False
        )
        print("✅ Authentication successful!\n")
        
        # Search for people
        print(f"🔍 Searching for: '{args.keyword}'...")
        results = linkedin.search_people(
            keywords=args.keyword,
            limit=args.limit,
            network_depths=['S', 'O'],  # 2nd and 3rd degree connections
            include_private_profiles=False
        )
        
        print(f"📋 Found {len(results)} profiles\n")
        
        if not results:
            print("⚠️ No profiles found. Try different keywords.")
            return
        
        # Send connection requests
        invitation = Invitation()
        start_time = time.time()
        success_count = 0
        failure_count = 0
        
        for i, profile in enumerate(results, 1):
            name = profile.get('name', 'Unknown')
            public_id = profile.get('public_id')
            urn_id = profile.get('urn_id')
            job_title = profile.get('jobtitle', 'N/A')
            location = profile.get('location', 'N/A')
            
            if not public_id:
                print(f"  ⏭️ Skipping {name} (no public ID)")
                continue
            
            print(f"\n[{i}/{len(results)}] {name}")
            print(f"  📌 {job_title}")
            print(f"  📍 {location}")
            
            try:
                # Send connection request
                success = linkedin.add_connection(
                    public_id,
                    message=args.message,
                    profile_urn=urn_id
                )
                
                if success:
                    print(f"  ✅ Connection request sent!")
                    success_count += 1
                    
                    # Optionally unfollow
                    if args.nofollow and urn_id:
                        linkedin.unfollow_connection(urn_id)
                        print(f"  👋 Unfollowed")
                else:
                    print(f"  ❌ Failed to send request")
                    failure_count += 1
                    
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                failure_count += 1
            
            # Random delay to avoid rate limiting (3-7 seconds)
            if i < len(results):
                delay = 3 + (hash(name) % 5)  # Pseudo-random 3-7 seconds
                print(f"  ⏳ Waiting {delay}s...")
                time.sleep(delay)
        
        # Summary
        elapsed = time.time() - start_time
        print("\n" + "=" * 60)
        print("📊 SUMMARY")
        print("=" * 60)
        print(f"✅ Successful: {success_count}")
        print(f"❌ Failed: {failure_count}")
        print(f"⏱️ Time elapsed: {elapsed:.1f}s")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
