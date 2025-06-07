# サンプルエージェントコード

## 求人マッチングAIエージェント

### コアマッチングアルゴリズム

```python
# job_matcher.py
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple
import pandas as pd

class JobMatcher:
    def __init__(self):
        self.skill_vectorizer = TfidfVectorizer(stop_words='english')
        self.text_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.skill_weights = {
            'required': 1.0,
            'preferred': 0.7,
            'nice_to_have': 0.3
        }
    
    def calculate_match_score(
        self,
        candidate: Dict,
        job: Dict
    ) -> Dict[str, float]:
        """候補者と求人のマッチスコアを包括的に算出"""
        
        # スキルマッチ（40%）
        skill_score = self._calculate_skill_match(
            candidate['skills'],
            job['requirements']['skills']
        )
        
        # 経験マッチ（30%）
        experience_score = self._calculate_experience_match(
            candidate['experience'],
            job['requirements']['experience']
        )
        
        # 学歴マッチ（15%）
        education_score = self._calculate_education_match(
            candidate['education'],
            job['requirements']['education']
        )
        
        # 勤務地マッチ（10%）
        location_score = self._calculate_location_match(
            candidate['location'],
            job['location']
        )
        
        # テキスト類似度（5%）
        text_score = self._calculate_text_similarity(
            candidate['summary'],
            job['description']
        )
        
        # 重み付き総合スコアを計算
        overall_score = (
            skill_score * 0.40 +
            experience_score * 0.30 +
            education_score * 0.15 +
            location_score * 0.10 +
            text_score * 0.05
        )
        
        return {
            'overall_score': min(overall_score, 100),
            'skill_score': skill_score,
            'experience_score': experience_score,
            'education_score': education_score,
            'location_score': location_score,
            'text_score': text_score,
            'recommendation': self._get_recommendation(overall_score)
        }
    
    def _calculate_skill_match(
        self,
        candidate_skills: List[Dict],
        job_skills: List[Dict]
    ) -> float:
        """スキルマッチスコアを算出"""
        if not job_skills:
            return 80.0  # 要求スキルがなければデフォルトスコア
        
        total_weight = 0
        matched_weight = 0
        
        for job_skill in job_skills:
            skill_name = job_skill['name'].lower()
            requirement_level = job_skill.get('level', 'intermediate')
            importance = job_skill.get('importance', 'required')
            
            weight = self.skill_weights.get(importance, 0.5)
            total_weight += weight
            
            # 候補者スキルと一致するか
            candidate_skill = next(
                (cs for cs in candidate_skills
                 if cs['name'].lower() == skill_name),
                None
            )
            
            if candidate_skill:
                # レベルマッチ判定
                level_match = self._calculate_skill_level_match(
                    candidate_skill.get('level', 'beginner'),
                    requirement_level
                )
                matched_weight += weight * level_match
        
        return (matched_weight / total_weight * 100) if total_weight > 0 else 0
    
    def _calculate_skill_level_match(
        self,
        candidate_level: str,
        required_level: str
    ) -> float:
        """スキルレベルマッチ度を算出"""
        level_hierarchy = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        }
        
        candidate_value = level_hierarchy.get(candidate_level.lower(), 1)
        required_value = level_hierarchy.get(required_level.lower(), 2)
        
        if candidate_value >= required_value:
            return 1.0
        elif candidate_value == required_value - 1:
            return 0.7
        else:
            return 0.3
    
    def _calculate_experience_match(
        self,
        candidate_exp: List[Dict],
        job_requirements: Dict
    ) -> float:
        """経験マッチスコアを算出"""
        required_years = job_requirements.get('min_years', 0)
        required_roles = job_requirements.get('roles', [])
        
        # 合計経験年数
        total_years = sum(exp.get('duration_years', 0) for exp in candidate_exp)
        
        # 年数スコア（0-100）
        years_score = min(total_years / max(required_years, 1) * 100, 100)
        
        # 職種関連スコア
        role_score = 0
        if required_roles:
            relevant_years = 0
            for exp in candidate_exp:
                exp_title = exp.get('title', '').lower()
                if any(role.lower() in exp_title for role in required_roles):
                    relevant_years += exp.get('duration_years', 0)
            
            role_score = min(relevant_years / max(required_years, 1) * 100, 100)
        else:
            role_score = years_score
        
        return (years_score * 0.4 + role_score * 0.6)
    
    def _calculate_location_match(
        self,
        candidate_location: Dict,
        job_location: Dict
    ) -> float:
        """勤務地の適合度を算出"""
        # リモートワーク対応
        if job_location.get('remote', False):
            return 100.0
        
        if candidate_location.get('willing_to_relocate', False):
            return 90.0
        
        # 都市一致
        if (candidate_location.get('city', '').lower() ==
            job_location.get('city', '').lower()):
            return 100.0
        
        # 都道府県一致
        if (candidate_location.get('state', '').lower() ==
            job_location.get('state', '').lower()):
            return 75.0
        
        # 国一致
        if (candidate_location.get('country', '').lower() ==
            job_location.get('country', '').lower()):
            return 50.0
        
        return 20.0
    
    def _get_recommendation(self, score: float) -> str:
        """スコアに応じた推奨コメント"""
        if score >= 85:
            return "高マッチ - 面接を強く推奨"
        elif score >= 70:
            return "良マッチ - 面接検討"
        elif score >= 55:
            return "ややマッチ - 詳細確認要"
        else:
            return "低マッチ - 他候補推奨"

# 使用例
def main():
    matcher = JobMatcher()
    
    # サンプル候補者
    candidate = {
        'id': 'candidate_123',
        'name': '山田太郎',
        'skills': [
            {'name': 'Python', 'level': 'advanced', 'years': 5},
            {'name': 'JavaScript', 'level': 'intermediate', 'years': 3},
            {'name': 'React', 'level': 'advanced', 'years': 4},
            {'name': 'SQL', 'level': 'intermediate', 'years': 3}
        ],
        'experience': [
            {
                'title': 'シニアソフトウェアエンジニア',
                'company': 'Tech Corp',
                'duration_years': 3,
                'description': 'ReactとPythonを使ったWebアプリ開発'
            },
            {
                'title': 'ソフトウェアエンジニア',
                'company': 'StartupXYZ',
                'duration_years': 2,
                'description': 'モダン技術によるフルスタック開発'
            }
        ],
        'education': [
            {
                'degree': '学士',
                'field': 'コンピューターサイエンス',
                'institution': '国立大学'
            }
        ],
        'location': {
            'city': '東京',
            'state': '東京都',
            'country': '日本',
            'willing_to_relocate': False
        },
        'summary': 'Web開発に強みを持つ経験豊富なソフトウェアエンジニア'
    }
    
    # サンプル求人
    job = {
        'id': 'job_456',
        'title': 'シニアフルスタック開発者',
        'company': 'Innovation Labs',
        'description': 'スケーラブルなWebアプリ開発経験者を募集',
        'requirements': {
            'skills': [
                {'name': 'Python', 'level': 'advanced', 'importance': 'required'},
                {'name': 'React', 'level': 'intermediate', 'importance': 'required'},
                {'name': 'JavaScript', 'level': 'intermediate', 'importance': 'required'},
                {'name': 'Docker', 'level': 'intermediate', 'importance': 'preferred'}
            ],
            'experience': {
                'min_years': 4,
                'roles': ['ソフトウェアエンジニア', 'フルスタック開発者']
            },
            'education': {
                'min_level': '学士',
                'fields': ['コンピューターサイエンス', '工学']
            }
        },
        'location': {
            'city': '東京',
            'state': '東京都',
            'country': '日本',
            'remote': False
        }
    }
    
    # マッチ判定
    match_result = matcher.calculate_match_score(candidate, job)
    
    print(f"マッチ判定結果：")
    print(f"総合スコア: {match_result['overall_score']:.1f}%")
    print(f"スキルマッチ: {match_result['skill_score']:.1f}%")
    print(f"経験マッチ: {match_result['experience_score']:.1f}%")
    print(f"学歴マッチ: {match_result['education_score']:.1f}%")
    print(f"勤務地マッチ: {match_result['location_score']:.1f}%")
    print(f"推奨: {match_result['recommendation']}")

if __name__ == "__main__":
    main()
```

# \[この後、履歴書解析エージェント、音声アシスタント統合、多言語対応エージェントの実装例が続きます。]
