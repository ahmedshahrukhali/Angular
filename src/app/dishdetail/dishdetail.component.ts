import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
    // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;

  commentForm: FormGroup;
  comment: Comment;

  errMess: string;

  dishcopy: Dish;
  
  visibility = 'shown';

  @ViewChild('cform') commentFormDirective;

  formErrors = {
    'author': '',
    'rating': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.',
      },
    'comment': {
      'required':      'Comment is required.',
      },
  };

  constructor(private dishservice: DishService, 
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('baseURL') private baseURL) {
      
      this.createForm();
     
    }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']);}))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
    errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  
  goBack(): void {
    this.location.back();
  }

  
  createForm() {this.commentForm = this.fb.group({
    author: ['', [Validators.required, Validators.minLength(2)] ],
    comment: ['', Validators.required ],
    rating: '5'
  });

    
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit(commentForm) {
    this.comment = this.commentForm.value;
    console.log(this.comment);
    this.comment.date = new Date().toISOString();
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
    .subscribe(dish => {
      this.dish = dish; this.dishcopy = dish;
    }, errMess => {this.dish = null; this.dishcopy = null; this.errMess = <any>errMess; });
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      comment: ['', Validators.required ],
      rating: '5'
    });
    this.commentFormDirective.resetForm({
      author:'',
      rating: '5',
      comment: ''
    });
  }

}
